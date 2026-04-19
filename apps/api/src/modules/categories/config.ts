import { z } from "zod"

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().default(50),
  name: z.string().optional(),
})

export const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})
