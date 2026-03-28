import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { trackRoute } from "./routes/track.route.js"
import { pixelRoute } from "./routes/pixel.route.js"

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .onError(({ error, set }) => {
    console.error("Conversion error:", error)
    set.status = 500
    return { success: false, error: "Internal server error" }
  })
  .get("/health", () => ({ status: "ok", service: "conversion" }))
  .use(trackRoute)
  .use(pixelRoute)
  .listen(Number(process.env["CONVERSION_PORT"] ?? 3003))

console.log(
  `AdsCrush Conversion running at http://localhost:${app.server?.port}`
)

export type ConversionApp = typeof app
