import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { LoginDto } from '../../dtos/auth.dto';

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new Error('Credenciales inválidas');
    }
    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn } as any);
    const { password: _, ...publicUser } = user;
    return { token, user: publicUser };
  }
}
