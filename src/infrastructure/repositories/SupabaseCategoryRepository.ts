import { ICategoryRepository, PaginationResult } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import supabase from '../database/supabaseClient';

function map(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export class SupabaseCategoryRepository implements ICategoryRepository {
  async findAll(page: number, limit: number): Promise<PaginationResult<Category>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await supabase
      .from('categories').select('*', { count: 'exact' })
      .order('name').range(from, to);
    if (error) throw new Error(error.message);
    const total = count ?? 0;
    return { data: (data ?? []).map(map), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Category | null> {
    const { data } = await supabase.from('categories').select('*').eq('id', id).single();
    return data ? map(data) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const { data } = await supabase.from('categories').select('*').eq('name', name).maybeSingle();
    return data ? map(data) : null;
  }

  async create(input: Pick<Category, 'name'>): Promise<Category> {
    const { data, error } = await supabase.from('categories').insert({ name: input.name }).select().single();
    if (error) throw new Error(error.message);
    return map(data);
  }

  async update(id: string, input: Pick<Category, 'name'>): Promise<Category> {
    const { data, error } = await supabase.from('categories').update({ name: input.name }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return map(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
