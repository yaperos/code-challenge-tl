import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).optional(),
  cursor: z.string().optional(),
});

export class PaginationDto extends createZodDto(PaginationSchema) {}
