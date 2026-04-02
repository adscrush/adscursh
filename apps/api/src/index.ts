import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { authRoutes } from "./modules/auth/auth.routes.js"
import { employeeRoutes } from "./modules/employees/employees.routes.js"
import { advertiserRoutes } from "./modules/advertisers/advertisers.routes.js"
import { affiliateRoutes } from "./modules/affiliates/affiliates.routes.js"
import { offerRoutes } from "./modules/offers/offers.routes.js"
import { reportRoutes } from "./modules/reports/reports.routes.js"
import openapi, { fromTypes } from "@elysiajs/openapi";

const PORT = process.env["PORT"] ?? 9999

const app = new Elysia({ name: "adscrush-api" })
    .use(
        cors({
            origin: process.env["DASHBOARD_URL"] ?? ["http://localhost:3000", "https://app.localhost", "https://app.adscrush.local", "https://api.adscrush.local"],
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"],
        })
    )
    .use(openapi({
        references: fromTypes(),
        documentation: {
            info: {
                title: "AdsCrush API",
                version: "1.0.0",
                description: "Official API documentation for AdsCrush. For Authentication (Sign-in, Signup, etc.), refer to the [Better Auth Specification](/api/auth/docs).",
            },
        },
    }))
    .onError(({ code, error, set }) => {
        if (code === "NOT_FOUND") return

        console.error("Unhandled error:", error)
        set.status = 500
        return { success: false, error: "Internal server error" }
    })
    .get("/", () => ({ status: "ok", service: "adscrush-api" }))
    .group("/api/v1", (app) => app
        .use(authRoutes)
        .use(employeeRoutes)
        .use(advertiserRoutes)
        .use(affiliateRoutes)
        .use(offerRoutes)
        .use(reportRoutes)

    ).listen(PORT)



console.log([
    `🚀 Server running at http://localhost:${PORT}`,
    `🚀 Proxy running at ${process.env["PUBLIC_API_URL"]}`
].join("\n"))

export default app
export type App = typeof app
