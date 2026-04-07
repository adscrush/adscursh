import { Elysia } from "elysia"
import { AppError, parsePostgresError } from "../utils/errors"
import { errorResponse } from "../utils/response"

/**
 * Global error handling middleware
 * Catches and formats all errors consistently
 */
export const errorHandler = new Elysia({ name: "error-handler" }).onError(
  { as: "global" },
  ({ code, error, set, request }) => {
    // Log all errors in development, or only unknown/server errors in production
    if (
      process.env.NODE_ENV === "development" ||
      code === "INTERNAL_SERVER_ERROR" ||
      code === "UNKNOWN"
    ) {
      console.error(`[Error ${code}]:`, error)
    }

    // Handle AppError (custom application errors)
    if (error instanceof AppError) {
      set.status = error.status
      return errorResponse(error.message, error.details)
    }

    // Handle PostgreSQL errors (drizzle/bun-postgres wrap them but keep .code)
    if (error instanceof Error) {
      const appError = parsePostgresError(error)
      if (appError) {
        set.status = appError.status
        return errorResponse(appError.message, appError.details)
      }
    }

    // Handle different error types
    switch (code) {
      case "VALIDATION":
        set.status = 400
        return errorResponse("Validation failed", JSON.parse(error.message))

      case "NOT_FOUND":
        set.status = 404
        return errorResponse("Resource not found")

      case "PARSE":
        set.status = 400
        return errorResponse("Invalid request format")

      case "INTERNAL_SERVER_ERROR":
      default:
        set.status = 500
        return errorResponse(
          "An unexpected error occurred",
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined
        )
    }
  }
)
