import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { UpdateProductDto } from '../../dtos/product.dto';

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateProductDto) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) throw new Error('Categoría no encontrada');
    }
    return this.productRepository.update(id, dto);
  }
}
