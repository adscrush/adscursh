import { z } from "zod"

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  departmentId: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(["admin", "employee"]).default("employee").nonoptional(),
})

export const updateEmployeeSchema = z.object({
  departmentId: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
})

export const updateEmployeePermissionsSchema = z.object({
  permissions: z.array(z.string()),
})

export const updateEmployeeAccessSchema = z.object({
  affiliateIds: z.array(z.string()).optional(),
  advertiserIds: z.array(z.string()).optional(),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
