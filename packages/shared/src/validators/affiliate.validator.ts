import { z } from "zod"

export const createAffiliateSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().optional(),
  email: z.email(),
  password: z.string().min(8).optional(),
  accountManagerId: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
})

export const updateAffiliateSchema = z.object({
  name: z.string().min(1).optional(),
  companyName: z.string().optional(),
  email: z.email().optional(),
  accountManagerId: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
})

export type CreateAffiliateInput = z.infer<typeof createAffiliateSchema>
export type UpdateAffiliateInput = z.infer<typeof updateAffiliateSchema>

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["active", "inactive", "pending"]),
})

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>
