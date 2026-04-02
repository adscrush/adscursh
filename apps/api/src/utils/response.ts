/**
 * Standard response helpers for consistent API responses
 */

export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
}

export interface ErrorResponse {
    success: false;
    error: string;
    details?: unknown;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T): SuccessResponse<T> {
    return {
        success: true,
        data,
    };
}

/**
 * Create a standardized error response
 */
export function errorResponse(error: string, details?: unknown): ErrorResponse {
    const response: ErrorResponse = {
        success: false,
        error,
    };

    if (details !== undefined) {
        response.details = details;
    }

    return response;
}