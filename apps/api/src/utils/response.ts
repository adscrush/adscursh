/**
 * Standard response helpers for consistent API responses
 */

export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    meta?: unknown;
}

export interface ErrorResponse {
    success: false;
    error: string;
    details?: ErrorDetails;
}

export type ErrorDetails = string | Record<string, string | string[]>;

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, meta?: unknown): SuccessResponse<T> {
    const response: SuccessResponse<T> = {
        success: true,
        data,
    };
    if (meta) response.meta = meta;
    return response;
}

/**
 * Create a standardized error response
 */
export function errorResponse(error: string, details?: ErrorDetails): ErrorResponse {
    const response: ErrorResponse = {
        success: false,
        error,
    };

    if (details !== undefined) {
        response.details = details;
    }

    return response;
}

/**
 * Format Zod validation errors into field-level messages
 */
export function formatZodError(zodError: unknown): Record<string, string[]> {
    if (!zodError || typeof zodError !== "object") return {};

    // Handle Elysia's validation errors (which wrap Zod errors)
    if ("all" in (zodError as Record<string, unknown>)) {
        const all = (zodError as Record<string, { errors: string[] }>).all;
        if (all && typeof all === "object") {
            const formatted: Record<string, string[]> = {};
            for (const [field, value] of Object.entries(all)) {
                if (Array.isArray(value)) {
                    formatted[field] = value;
                } else if (value && typeof value === "object" && "errors" in value) {
                    formatted[field] = (value as { errors: string[] }).errors;
                }
            }
            return formatted;
        }
    }

    // Handle standard ZodError shape
    if ("issues" in (zodError as Record<string, unknown>)) {
        const issues = (zodError as { issues: { path: (string | number)[]; message: string }[] }).issues;
        const formatted: Record<string, string[]> = {};
        for (const issue of issues) {
            const path = issue.path.map(String).join(".");
            if (!formatted[path]) formatted[path] = [];
            formatted[path].push(issue.message);
        }
        return formatted;
    }

    return { general: ["Validation failed"] };
}
