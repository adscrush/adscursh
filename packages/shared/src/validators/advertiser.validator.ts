import { z } from "zod"

export const createAdvertiserSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string().optional(),
  accountManagerId: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
})

export const updateAdvertiserSchema = z.object({
  name: z.string().min(1).optional(),
  companyName: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string().optional(),
  accountManagerId: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
})

export type CreateAdvertiserInput = z.infer<typeof createAdvertiserSchema>
export type UpdateAdvertiserInput = z.infer<typeof updateAdvertiserSchema>
