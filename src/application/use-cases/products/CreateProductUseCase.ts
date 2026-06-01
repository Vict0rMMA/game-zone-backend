import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { CreateProductDto } from '../../dtos/product.dto';

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(dto: CreateProductDto) {
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) throw new Error('Categoría no encontrada');
    return this.productRepository.create({ ...dto, description: dto.description ?? null, image: dto.image ?? null });
  }
}
