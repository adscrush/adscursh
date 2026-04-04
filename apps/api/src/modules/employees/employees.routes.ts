import Elysia from "elysia"
import { requireAdmin } from "../../middleware/auth.middleware"
import { db } from "../../lib/db"
import { auth } from "../../lib/auth"
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeAccess,
} from "./employees.service"
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeAccessSchema,
} from "@adscrush/shared/validators/employee.validator"

export const employeeRoutes = new Elysia({ prefix: "/api/employees" })
  .use(requireAdmin)
  .get("/", async ({ query }) => {
    const result = await listEmployees(db, {
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      search: query.search as string | undefined,
      status: query.status as string | undefined,
    })
    return { success: true, ...result }
  })
  .get("/:id", async ({ params, set }) => {
    const employee = await getEmployee(db, params.id)
    if (!employee) {
      set.status = 404
      return { success: false, error: "Employee not found" }
    }
    return { success: true, data: employee }
  })
  .post("/", async ({ body, set }) => {
    const parsed = createEmployeeSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    try {
      const user = await auth.api.signUpEmail({
        body: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
        },
      })

      if (!user) {
        set.status = 400
        return { success: false, error: "Failed to create user account" }
      }

      const userId =
        typeof user === "object" && "user" in user
          ? (user as { user: { id: string } }).user.id
          : null

      if (!userId) {
        set.status = 400
        return { success: false, error: "Failed to get user ID" }
      }

      const employee = await createEmployee(db, {
        userId,
        department: parsed.data.department,
      })

      set.status = 201
      return { success: true, data: employee }
    } catch (error) {
      set.status = 400
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create",
      }
    }
  })
  .put("/:id", async ({ params, body, set }) => {
    const parsed = updateEmployeeSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const employee = await updateEmployee(db, params.id, parsed.data)
    if (!employee) {
      set.status = 404
      return { success: false, error: "Employee not found" }
    }
    return { success: true, data: employee }
  })
  .put("/:id/access", async ({ params, body, set }) => {
    const parsed = updateEmployeeAccessSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    await updateEmployeeAccess(db, params.id, parsed.data)
    return { success: true }
  })
