import { IProductRepository, ProductFilters } from '../../domain/repositories/IProductRepository';
import { Product, ProductWithCategory } from '../../domain/entities/Product';
import { PaginationResult } from '../../domain/repositories/ICategoryRepository';
import prisma from '../database/prismaClient';
import { Prisma } from '@prisma/client';

const include = { category: { select: { id: true, name: true } } };

function toProduct(p: { price: Prisma.Decimal; [key: string]: unknown }): ProductWithCategory {
  return { ...p, price: Number(p.price) } as unknown as ProductWithCategory;
}

export class PrismaProductRepository implements IProductRepository {
  async findAll(page: number, limit: number, filters: ProductFilters): Promise<PaginationResult<ProductWithCategory>> {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      ...(filters.search && { name: { contains: filters.search, mode: 'insensitive' } }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
    };
    const [data, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, include, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);
    return {
      data: data.map(toProduct),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<ProductWithCategory | null> {
    const p = await prisma.product.findUnique({ where: { id }, include });
    return p ? toProduct(p as { price: Prisma.Decimal; [key: string]: unknown }) : null;
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductWithCategory> {
    const p = await prisma.product.create({ data: { ...data, price: data.price }, include });
    return toProduct(p as { price: Prisma.Decimal; [key: string]: unknown });
  }

  async update(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProductWithCategory> {
    const p = await prisma.product.update({ where: { id }, data, include });
    return toProduct(p as { price: Prisma.Decimal; [key: string]: unknown });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
