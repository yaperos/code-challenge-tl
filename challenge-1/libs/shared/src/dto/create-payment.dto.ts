import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  amount: z.number().positive({ message: "Amount must be a positive number" }),
  currency: z.string().length(3).toUpperCase(),
  country: z.string().length(2).toUpperCase(),
});

export class CreatePaymentDto extends createZodDto(CreatePaymentSchema) {}
