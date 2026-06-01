import { IProductRepository, ProductFilters } from '../../../domain/repositories/IProductRepository';

export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(page: number, limit: number, filters: ProductFilters) {
    return this.productRepository.findAll(page, limit, filters);
  }
}
