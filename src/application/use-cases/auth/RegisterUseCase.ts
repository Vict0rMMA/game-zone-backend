import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { RegisterDto } from '../../dtos/auth.dto';

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('Ya existe una cuenta con ese correo electrónico');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: 'USER',
    });
    const { password: _, ...publicUser } = user;
    return publicUser;
  }
}
