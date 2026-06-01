import { IProductRepository, ProductFilters } from '../../domain/repositories/IProductRepository';
import { Product, ProductWithCategory } from '../../domain/entities/Product';
import { PaginationResult } from '../../domain/repositories/ICategoryRepository';
import supabase from '../database/supabaseClient';

function map(row: Record<string, unknown>): ProductWithCategory {
  const cat = row.categories as Record<string, unknown> | null;
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    price: Number(row.price),
    stock: row.stock as number,
    image: (row.image as string) ?? null,
    categoryId: row.category_id as string,
    category: cat ? { id: cat.id as string, name: cat.name as string } : { id: '', name: '' },
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

const SELECT = '*, categories(id, name)';

export class SupabaseProductRepository implements IProductRepository {
  async findAll(page: number, limit: number, filters: ProductFilters): Promise<PaginationResult<ProductWithCategory>> {
    const from = (page - 1) * limit;
    let q = supabase.from('products').select(SELECT, { count: 'exact' }).order('created_at', { ascending: false });
    if (filters.search) q = q.ilike('name', `%${filters.search}%`);
    if (filters.categoryId) q = q.eq('category_id', filters.categoryId);
    const { data, count, error } = await q.range(from, from + limit - 1);
    if (error) throw new Error(error.message);
    const total = count ?? 0;
    return { data: (data ?? []).map(r => map(r as Record<string, unknown>)), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<ProductWithCategory | null> {
    const { data } = await supabase.from('products').select(SELECT).eq('id', id).single();
    return data ? map(data as Record<string, unknown>) : null;
  }

  async create(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductWithCategory> {
    const { data, error } = await supabase.from('products').insert({
      name: input.name, description: input.description, price: input.price,
      stock: input.stock, image: input.image ?? null, category_id: input.categoryId,
    }).select(SELECT).single();
    if (error) throw new Error(error.message);
    return map(data as Record<string, unknown>);
  }

  async update(id: string, input: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProductWithCategory> {
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.price !== undefined) patch.price = input.price;
    if (input.stock !== undefined) patch.stock = input.stock;
    if (input.categoryId !== undefined) patch.category_id = input.categoryId;
    if (input.image !== undefined) patch.image = input.image;
    const { data, error } = await supabase.from('products').update(patch).eq('id', id).select(SELECT).single();
    if (error) throw new Error(error.message);
    return map(data as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
