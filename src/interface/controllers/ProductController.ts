import { Response, NextFunction } from 'express';
import { GetProductsUseCase } from '../../application/use-cases/products/GetProductsUseCase';
import { CreateProductUseCase } from '../../application/use-cases/products/CreateProductUseCase';
import { UpdateProductUseCase } from '../../application/use-cases/products/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../application/use-cases/products/DeleteProductUseCase';
import { createProductDto, updateProductDto, productQueryDto } from '../../application/dtos/product.dto';
import { PrismaProductRepository } from '../../infrastructure/repositories/PrismaProductRepository';
import { PrismaCategoryRepository } from '../../infrastructure/repositories/PrismaCategoryRepository';
import { AuthRequest } from '../middlewares/auth.middleware';

const productRepo = new PrismaProductRepository();
const categoryRepo = new PrismaCategoryRepository();
const getAll = new GetProductsUseCase(productRepo);
const create = new CreateProductUseCase(productRepo, categoryRepo);
const update = new UpdateProductUseCase(productRepo, categoryRepo);
const remove = new DeleteProductUseCase(productRepo);

export class ProductController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, categoryId } = productQueryDto.parse(req.query);
      const result = await getAll.execute(page, limit, { search, categoryId });
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productRepo.findById(String(req.params.id));
      if (!product) { res.status(404).json({ message: 'Producto no encontrado' }); return; }
      res.json(product);
    } catch (err) { next(err); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createProductDto.parse(req.body);
      const product = await create.execute(dto);
      res.status(201).json(product);
    } catch (err) { next(err); }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = updateProductDto.parse(req.body);
      const product = await update.execute(String(req.params.id), dto);
      res.json(product);
    } catch (err) { next(err); }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await remove.execute(String(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  }
}
