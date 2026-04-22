import { Elysia } from "elysia"
import env from "./env"
import { clickRoute } from "./routes/click.route.js"
import { pixelRoute } from "./routes/pixel.route.js"
import { trackRoute } from "./routes/track.route.js"

const app = new Elysia()
  .onError(({ error, set, request }) => {
    console.error(`Tracking error at ${request.url}:`, error)
    
    // Attempt to extract offer URL from database if we have an offer ID in the query
    // But since this is a global error handler, it might be safer to redirect to a generic 404 or home
    // The specific route handler should handle its own redirection fallbacks.
    
    if (set.status === 404) {
       return { error: "NOT_FOUND", status: 404, message: "The requested resource was not found" }
    }

    set.status = 500
    return { error: "INTERNAL_SERVER_ERROR", status: 500, message: "An unexpected error occurred" }
  })
  .get("/health", () => ({ status: "ok", service: "tracking", timestamp: new Date().toISOString() }))
  .use(clickRoute)
  .use(pixelRoute)
  .use(trackRoute)
  .all("*", ({ request, set }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`)
    set.status = 404
    return { error: "NOT_FOUND", message: `No route found for ${new URL(request.url).pathname}` }
  })
  .listen(env.TRACKING_PORT)

console.log(`🚀 AdsCrush Tracking running at http://localhost:${app.server?.port}`)

export type TrackingApp = typeof app
