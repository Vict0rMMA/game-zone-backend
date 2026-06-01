import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(page: number, limit: number) {
    return this.categoryRepository.findAll(page, limit);
  }
}
