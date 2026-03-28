import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { authRoutes } from "./modules/auth/auth.routes.js"
import { employeeRoutes } from "./modules/employees/employees.routes.js"
import { advertiserRoutes } from "./modules/advertisers/advertisers.routes.js"
import { affiliateRoutes } from "./modules/affiliates/affiliates.routes.js"
import { offerRoutes } from "./modules/offers/offers.routes.js"
import { reportRoutes } from "./modules/reports/reports.routes.js"
import openapi, { fromTypes } from "@elysiajs/openapi";

const app = new Elysia()
  .use(
    cors({
      origin: process.env["DASHBOARD_URL"] ?? "http://localhost:3000",
      credentials: true,
    })
  )
  .onError(({ error, set }) => {
    console.error("Unhandled error:", error)
    set.status = 500
    return { success: false, error: "Internal server error" }
  }).use(openapi({
    references: fromTypes(),
    documentation: {
      info: {
        title: "AdsCrush API",
        version: "1.0.0",
        description: "Official API documentation for AdsCrush. For Authentication (Sign-in, Signup, etc.), refer to the [Better Auth Specification](/api/auth/docs).",
      },
      externalDocs: {
        url: "/api/auth/docs",
        description: "Better Auth Documentation",
      },
      tags: [
        { name: "Authentication", description: "Authentication and Session Management", externalDocs: { url: "/api/auth/docs" } }
      ],
    },
  }))
  .get("/", () => ({ status: "ok", service: "api" }))
  .use(authRoutes)
  .use(employeeRoutes)
  .use(advertiserRoutes)
  .use(affiliateRoutes)
  .use(offerRoutes)
  .use(reportRoutes)
  .listen(Number(process.env["API_PORT"] ?? 3001))

console.log(`AdsCrush API running at http://localhost:${app.server?.port}`)
console.log(`Proxied through https://api.localhost`)

export type App = typeof app
