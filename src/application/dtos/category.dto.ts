import { z } from 'zod';

export const createCategoryDto = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
});

export const updateCategoryDto = createCategoryDto;

export const paginationDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryDto>;
export type PaginationDto = z.infer<typeof paginationDto>;
