import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new Error('Categoría no encontrada');
    await this.categoryRepository.delete(id);
  }
}
