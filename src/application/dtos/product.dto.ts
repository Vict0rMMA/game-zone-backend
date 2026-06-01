import { z } from 'zod';

export const createProductDto = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  categoryId: z.string().uuid('ID de categoría inválido'),
});

export const updateProductDto = createProductDto.partial();

export const productQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
});

export type CreateProductDto = z.infer<typeof createProductDto>;
export type UpdateProductDto = z.infer<typeof updateProductDto>;
export type ProductQueryDto = z.infer<typeof productQueryDto>;
