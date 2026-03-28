import Elysia from "elysia"
import { auth } from "../lib/auth"

export const authMiddleware = new Elysia({ name: "auth-middleware" }).derive(
  { as: "global" },
  async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    return {
      user: session?.user ?? null,
      session: session?.session ?? null,
    }
  }
)

export const requireAuth = new Elysia({ name: "require-auth" })
  .use(authMiddleware)
  .onBeforeHandle({ as: "local" }, ({ user, set }) => {
    if (!user) {
      set.status = 401
      return { success: false, error: "Unauthorized" }
    }
  })

export const requireAdmin = new Elysia({ name: "require-admin" })
  .use(requireAuth)
  .onBeforeHandle({ as: "local" }, ({ user, set }) => {
    if (user?.role !== "admin") {
      set.status = 403
      return { success: false, error: "Forbidden: Admin access required" }
    }
  })
