import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { CreateCategoryDto } from '../../dtos/category.dto';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findByName(dto.name);
    if (existing) throw new Error('Ya existe una categoría con ese nombre');
    return this.categoryRepository.create(dto);
  }
}
