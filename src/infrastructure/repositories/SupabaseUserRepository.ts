import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, Role } from '../../domain/entities/User';
import supabase from '../database/supabaseClient';

function map(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    password: row.password as string,
    role: row.role as Role,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data ? map(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data ? map(data) : null;
  }

  async create(input: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await supabase.from('users').insert({
      name: input.name, email: input.email, password: input.password, role: input.role,
    }).select().single();
    if (error) throw new Error(error.message);
    return map(data);
  }
}
