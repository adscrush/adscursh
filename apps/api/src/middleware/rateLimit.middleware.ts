import { Elysia } from "elysia";
import { Redis } from "@upstash/redis";

// Rate limiting middleware using Upstash Redis (works with Cloudflare Workers)
export const rateLimit = () => {
  // Initialize Redis connection - will work with Upstash or similar
  const redis = new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"],
    token: process.env["UPSTASH_REDIS_REST_TOKEN"],
  });

  return new Elysia({ name: "rate-limit" }).derive(
    { as: "global" },
    async ({ request, set }) => {
      // Skip rate limiting in development
      if (process.env.NODE_ENV === "development") {
        return {};
      }

      // Get IP address for rate limiting
      const ip = request.headers.get("x-forwarded-for") ||
                 request.headers.get("x-real-ip") ||
                 "unknown";

      // Different limits for different routes
      const path = new URL(request.url).pathname;

      // Define rate limits: { windowMs, maxRequests }
      const limits: Record<string, { windowMs: number; maxRequests: number }> = {
        "/api/v1/auth": { windowMs: 60000, maxRequests: 10 }, // auth endpoints stricter
        "/api/v1/reports": { windowMs: 60000, maxRequests: 20 }, // reports moderate
        "default": { windowMs: 60000, maxRequests: 100 } // general API
      };

      // Find matching limit
      const limit = Object.keys(limits).find(key =>
        path.startsWith(key) || key === "default"
      ) ?? "default";

      const { windowMs, maxRequests } = limits[limit];

      // Create Redis key
      const key = `rate_limit:${ip}:${limit}`;

      try {
        // Increment counter and get TTL
        const [count, ttl] = await redis.pipeline()
          .incr(key)
          .expire(key, Math.ceil(windowMs / 1000))
          .exec();

        const currentCount = Number(count[0] ?? 1);

        // Set rate limit headers
        set.headers["X-RateLimit-Limit"] = maxRequests.toString();
        set.headers["X-RateLimit-Remaining"] = Math.max(0, maxRequests - currentCount).toString();
        set.headers["X-RateLimit-Reset"] = (Date.now() + (ttl[1] ?? 0) * 1000).toString();

        // Check if limit exceeded
        if (currentCount > maxRequests) {
          set.status = 429;
          return {
            success: false,
            error: "Rate limit exceeded",
            retryAfter: Math.ceil((ttl[1] ?? 0))
          };
        }

        return {};
      } catch (error) {
        // If Redis fails, fail open (allow request) to prevent blocking legitimate traffic
        console.error("Rate limiting error:", error);
        return {};
      }
    }
  );
};