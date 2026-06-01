import { IProductRepository } from '../../../domain/repositories/IProductRepository';

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    await this.productRepository.delete(id);
  }
}
