export class AppError extends Error {
    public readonly status: number;
    public readonly code?: string;
    public readonly details?: unknown;

    constructor(status: number, message: string, code?: string, details?: unknown) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.name = "AppError";

        // Restore prototype chain for instance checks
        Object.setPrototypeOf(this, AppError.prototype);
    }
}