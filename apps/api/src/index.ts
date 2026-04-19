import { cors } from "@elysiajs/cors"
import openapi, { fromTypes } from "@elysiajs/openapi"
import { Elysia } from "elysia"
import env from "./env"
import { advertiserRoutes } from "./modules/advertisers/module"
import { affiliateRoutes } from "./modules/affiliates/module"
import { authRoutes } from "./modules/auth/auth.routes"
import { departmentRoutes } from "./modules/departments/module"
import { employeeRoutes } from "./modules/employees/module"
import { offerRoutes } from "./modules/offers/module"
import { categoryRoutes } from "./modules/categories/module"
import { reportRoutes } from "./modules/reports/module"
import { errorHandler } from "./middleware/error.middleware"
import { security } from "./middleware/security.middleware"

const app = new Elysia({ name: "adscrush-api" })
  .use(security())
  .use(
    cors({
      origin: process.env["DASHBOARD_URL"] ?? [
        "http://localhost:3000",
        "https://app.localhost",
        "https://app.adscrush.local",
        "https://api.adscrush.local",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(
    openapi({
      references: fromTypes(),
      documentation: {
        info: {
          title: "AdsCrush API",
          version: "1.0.0",
          description:
            "Official API documentation for AdsCrush. For Authentication (Sign-in, Signup, etc.), refer to the [Better Auth Specification](/api/auth/docs).",
        },
      },
    })
  )
  .use(errorHandler)
  .get("/", () => ({ status: "ok", service: "adscrush-api" }))
  .group("/api/v1", (app) =>
    app
      .use(authRoutes)
      .use(employeeRoutes)
      .use(departmentRoutes)
      .use(advertiserRoutes)
      .use(affiliateRoutes)
      .use(offerRoutes)
      .use(categoryRoutes)
      .use(reportRoutes)
  )
  .listen(env.PORT)

console.log(
  [
    `🟢 Server running at http://localhost:${env.PORT}`,
    `🟢 Proxy running at ${env.PUBLIC_API_URL}`,
  ].join("\n")
)

export type AppType = typeof app
