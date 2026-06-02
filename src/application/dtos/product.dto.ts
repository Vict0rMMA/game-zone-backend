import { z } from 'zod';

export const createProductDto = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  image: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
  type: z.enum(['game', 'peripheral']).default('game'),
  categoryId: z.string().uuid('ID de categoría inválido'),
});

export const updateProductDto = createProductDto.partial();

export const productQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(['game', 'peripheral']).optional(),
});

export type CreateProductDto = z.infer<typeof createProductDto>;
export type UpdateProductDto = z.infer<typeof updateProductDto>;
export type ProductQueryDto = z.infer<typeof productQueryDto>;
