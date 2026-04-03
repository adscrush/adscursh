import { Elysia } from "elysia";

/**
 * Security middleware to add essential security headers and protections
 */
export const security = () => {
  return new Elysia({ name: "security" }).onRequest(({ set }) => {
    // Security Headers
    set.headers["X-Frame-Options"] = "DENY";
    set.headers["X-Content-Type-Options"] = "nosniff";
    set.headers["X-XSS-Protection"] = "1; mode=block";
    set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    set.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";

    // Remove server header to hide technology stack
    // set.headers["Server"] = ""; // Elysia might not allow removing, but we can set to minimal

    // Content Security Policy (adjust based on actual needs)
    set.headers["Content-Security-Policy"] =
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';";

    // HSTS in production
    if (process.env.NODE_ENV === "production") {
      set.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    }

    // Request size limiting (will be handled by Elysia's built-in parser limits)
    // But we can add custom logic if needed
  });
};

/**
 * Request size limiter middleware
 * Prevents overly large payloads that could cause DoS
 */
export const requestSizeLimit = (maxSizeInKB = 10) => {
  return new Elysia({ name: "request-size-limit" }).onRequest(({ request, set }) => {
    const contentLength = request.headers.get("content-length");

    if (contentLength) {
      const sizeInKB = parseInt(contentLength) / 1024;
      if (sizeInKB > maxSizeInKB) {
        set.status = 413; // Payload Too Large
        return {
          success: false,
          error: `Request payload too large. Maximum size allowed is ${maxSizeInKB}KB.`
        };
      }
    }

    // Also check for actual body size in case content-length is missing/misleading
    // Note: This is approximate as we can't easily measure stream size without consuming it
    // For production, consider using a proxy or more sophisticated approach
  });
};

/**
 * Timeout middleware to prevent long-running requests from tying up workers
 */
export const timeout = (seconds = 30) => {
  return new Elysia({ name: "timeout" }).onRequest(({ set }) => {
    // Set a timeout for the response
    // Note: Elysia/Bun handles timeouts at the server level, but we can add headers
    set.headers["X-Request-Timeout"] = `${seconds}s`;
    // Actual timeout enforcement would happen at the server/bun level
  });
};