import { auth } from "@/lib/auth";
import Elysia from "elysia"

export const authRoutes = new Elysia({ prefix: "/api/auth" }).get("/docs.json", async () => {
  const openAPISchema = await auth.api.generateOpenAPISchema();
  const postRequest = openAPISchema.paths["/sign-up/email"]?.post;
  const reqBody = postRequest?.requestBody?.content["application/json"]?.schema;
  if (reqBody && reqBody.properties) {
    if (!reqBody.properties.username) {
      reqBody.properties.username = {
        type: "string",
        minLength: 3,
        maxLength: 100,
        description: "Username is required",
        required: true,
      };
      reqBody.required = [...(reqBody.required || []), "username"];
    }
  }
  return openAPISchema;
}, {
  detail: {
    tags: ["Authentication"],
    summary: "View Better Auth JSON Schema",
  }
})
  .all("/*", async ({ request }) => {
    return auth.handler(request)
  }, {
    detail: {
      hide: true
    }
  })
