import { auth } from "~/lib/auth"
import Elysia from "elysia"

export const authRoutes = new Elysia()
  .get(
    "/auth/docs.json",
    async () => {
      const openAPISchema = await auth.api.generateOpenAPISchema()
      return openAPISchema
    },
    {
      detail: {
        tags: ["Authentication"],
        summary: "View Better Auth JSON Schema",
        hide: true,
      },
    }
  )
  .mount(auth.handler)
