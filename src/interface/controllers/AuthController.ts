import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { registerDto, loginDto } from '../../application/dtos/auth.dto';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../../infrastructure/database/prismaClient';

const userRepo = new PrismaUserRepository();
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
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      if (!user) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}
