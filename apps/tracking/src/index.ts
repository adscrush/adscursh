import { Elysia } from "elysia"
import { clickRoute } from "./routes/click.route.js"

const app = new Elysia()
  .onError(({ error, set }) => {
    console.error("Tracking error:", error)
    set.status = 500
    return "Internal server error"
  })
  .get("/health", () => ({ status: "ok", service: "tracking" }))
  .use(clickRoute)
  .listen(Number(process.env["TRACKING_PORT"] ?? 3002))

console.log(
  `AdsCrush Tracking running at http://localhost:${app.server?.port}`
)

export type TrackingApp = typeof app
