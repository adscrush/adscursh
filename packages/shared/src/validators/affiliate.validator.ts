import { z } from "zod"

export const createAffiliateSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  accountManagerId: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
})

export const updateAffiliateSchema = z.object({
  name: z.string().min(1).optional(),
  companyName: z.string().optional(),
  email: z.string().email().optional(),
  accountManagerId: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
})

export type CreateAffiliateInput = z.infer<typeof createAffiliateSchema>
export type UpdateAffiliateInput = z.infer<typeof updateAffiliateSchema>
