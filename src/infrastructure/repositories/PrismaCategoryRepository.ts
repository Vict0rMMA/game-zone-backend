import { ICategoryRepository, PaginationResult } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import prisma from '../database/prismaClient';

export class PrismaCategoryRepository implements ICategoryRepository {
  async findAll(page: number, limit: number): Promise<PaginationResult<Category>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.category.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.category.count(),
    ]);
    return { data: data as Category[], meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } }) as Promise<Category | null>;
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { name } }) as Promise<Category | null>;
  }

  async create(data: Pick<Category, 'name'>): Promise<Category> {
    return prisma.category.create({ data }) as Promise<Category>;
  }

  async update(id: string, data: Pick<Category, 'name'>): Promise<Category> {
    return prisma.category.update({ where: { id }, data }) as Promise<Category>;
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
