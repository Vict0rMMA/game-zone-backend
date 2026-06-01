import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { registerDto, loginDto } from '../../application/dtos/auth.dto';
import { SupabaseUserRepository } from '../../infrastructure/repositories/SupabaseUserRepository';
import { AuthRequest } from '../middlewares/auth.middleware';
import supabase from '../../infrastructure/database/supabaseClient';

const userRepo = new SupabaseUserRepository();
const registerUseCase = new RegisterUseCase(userRepo);
const loginUseCase = new LoginUseCase(userRepo);

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = registerDto.parse(req.body);
      const user = await registerUseCase.execute(dto);
      res.status(201).json({ message: 'Cuenta creada exitosamente', user });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = loginDto.parse(req.body);
      const result = await loginUseCase.execute(dto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users').select('id, name, email, role, created_at').eq('id', req.user!.id).single();
      if (!user) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}
