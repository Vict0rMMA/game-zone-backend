import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { UpdateCategoryDto } from '../../dtos/category.dto';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new Error('Categoría no encontrada');
    return this.categoryRepository.update(id, dto);
  }
}
