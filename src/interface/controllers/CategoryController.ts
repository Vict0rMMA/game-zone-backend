import { Response, NextFunction } from 'express';
import { GetCategoriesUseCase } from '../../application/use-cases/categories/GetCategoriesUseCase';
import { CreateCategoryUseCase } from '../../application/use-cases/categories/CreateCategoryUseCase';
import { UpdateCategoryUseCase } from '../../application/use-cases/categories/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/DeleteCategoryUseCase';
import { createCategoryDto, updateCategoryDto, paginationDto } from '../../application/dtos/category.dto';
import { PrismaCategoryRepository } from '../../infrastructure/repositories/PrismaCategoryRepository';
import { AuthRequest } from '../middlewares/auth.middleware';

const repo = new PrismaCategoryRepository();
const getAll = new GetCategoriesUseCase(repo);
const create = new CreateCategoryUseCase(repo);
const update = new UpdateCategoryUseCase(repo);
const remove = new DeleteCategoryUseCase(repo);

export class CategoryController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = paginationDto.parse(req.query);
      const result = await getAll.execute(page, limit);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await repo.findById(String(req.params.id));
      if (!category) { res.status(404).json({ message: 'Categoría no encontrada' }); return; }
      res.json(category);
    } catch (err) { next(err); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createCategoryDto.parse(req.body);
      const category = await create.execute(dto);
      res.status(201).json(category);
    } catch (err) { next(err); }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = updateCategoryDto.parse(req.body);
      const category = await update.execute(String(req.params.id), dto);
      res.json(category);
    } catch (err) { next(err); }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await remove.execute(String(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  }
}
