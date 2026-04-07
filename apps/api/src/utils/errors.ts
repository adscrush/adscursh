export type ErrorDetails = string | Record<string, string | string[]>;

export class AppError extends Error {
    public readonly status: number;
    public readonly code?: string;
    public readonly details?: ErrorDetails;

    constructor(status: number, message: string, code?: string, details?: ErrorDetails) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.name = "AppError";

        // Restore prototype chain for instance checks
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Extract human-readable field names from a constraint name.
 * e.g. "affiliates_email_unique" → { field: "email", table: "affiliates" }
 */
function parseConstraintName(constraintName: string): { field: string; table: string } {
    const match = constraintName.match(/^(.+)_(.+?)_(unique|key)$/);
    if (match) {
        return { field: match[2]!, table: match[1]! };
    }
    return { field: "", table: "" };
}

/**
 * Try to extract the constraint name from an error message.
 * e.g. 'duplicate key value violates unique constraint "affiliates_email_unique"'
 */
function extractConstraintFromMessage(message: string): string | null {
    const match = message.match(/constraint "([^"]+)"/);
    return match?.[1] || null;
}

/**
 * Detect unique constraint violation from error message text.
 */
function isUniqueViolationMessage(msg: string): boolean {
    return msg.includes("duplicate key value violates unique constraint");
}

/**
 * Detect foreign key violation from error message text.
 */
function isForeignKeyViolationMessage(msg: string): boolean {
    return msg.includes("violates foreign key constraint");
}

/**
 * Detect not-null violation from error message text.
 */
function isNotNullViolationMessage(msg: string): boolean {
    return msg.includes("violates not-null constraint");
}

/**
 * Parse a PostgreSQL error (from postgres.js / Drizzle) and return a formatted AppError.
 *
 * Works with both:
 * 1. Native PG error code property (node-postgres style)
 * 2. Raw error message text (postgres.js / Bun style)
 *
 * Supported codes:
 * - 23505: unique_violation
 * - 23503: foreign_key_violation
 * - 23502: not_null_violation
 * - 23514: check_violation
 * - 42501: insufficient_privilege
 * - 57014: statement_timeout
 */
export function parsePostgresError(error: Error): AppError | null {
    const pgError = error as Error & {
        code?: string | number;
        detail?: string;
        hint?: string;
        constraint?: string;
        table?: string;
    };

    const code = String(pgError.code ?? "");
    const detail = pgError.detail ?? error.message;
    const message = error.message;

    // Detect by code OR message text (fallback for drivers that don't expose .code)
    const isUniqueViolation = code === "23505" || isUniqueViolationMessage(message);
    const isForeignKeyViolation = code === "23503" || isForeignKeyViolationMessage(message);
    const isNotNullViolation = code === "23502" || isNotNullViolationMessage(message);

    if (isUniqueViolation) {
        let field: string | undefined;
        let value: string | undefined;
        const keyMatch = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
        if (keyMatch) {
            field = keyMatch[1]!.split(", ").map(f => f.replace(/"/g, "")).join(", ");
            value = keyMatch[2];
        }

        const constraintName = pgError.constraint ?? extractConstraintFromMessage(message);
        if (constraintName) {
            const constraintField = parseConstraintName(constraintName).field;
            if (constraintField && !field) field = constraintField;
        }

        const appMessage = field
            ? `An entry with ${field} "${value}" already exists`
            : "A record with that value already exists";

        const details: Record<string, string> = {};
        if (field) details[field] = `Duplicate value: ${value ?? "unknown"}`;

        return new AppError(409, appMessage, "CONFLICT", Object.keys(details).length > 0 ? details : undefined);
    }

    if (isForeignKeyViolation) {
        const fkMatch = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
        let field = fkMatch?.[1];
        const value = fkMatch?.[2];

        const targetMatch = detail.match(/is not present in table "([^"]+)"/);
        const targetTable = targetMatch?.[1];

        const appMessage = field
            ? `The referenced ${field} "${value}" does not exist${targetTable ? ` in ${targetTable}` : ""}`
            : "An invalid foreign key reference was provided";

        const appDetails: Record<string, string> | undefined = field ? { [field]: `Invalid reference: ${value}` } : undefined;

        return new AppError(400, appMessage, "FOREIGN_KEY_VIOLATION", appDetails);
    }

    if (isNotNullViolation) {
        const columnMatch = detail.match(/column "([^"]+)"/);
        const column = columnMatch?.[1];

        const appMessage = column ? `The field "${column}" is required` : "A required field is missing";
        const appDetails: Record<string, string> | undefined = column ? { [column]: "This field cannot be null" } : undefined;

        return new AppError(400, appMessage, "NOT_NULL_VIOLATION", appDetails);
    }

    if (code === "23514") {
        return new AppError(400, detail, "CHECK_VIOLATION");
    }

    if (code === "42501") {
        return new AppError(403, "Database permission denied", "INSUFFICIENT_PRIVILEGE");
    }

    if (code === "57014") {
        return new AppError(504, "Request timed out. Please try again.", "STATEMENT_TIMEOUT");
    }

    // Generic database error — only match if message contains recognizable DB patterns
    if (message.includes("postgres") || message.includes("PostgreSQL") || code === "XX000" || code === "08") {
        return new AppError(500, "A database error occurred", "DATABASE_ERROR", process.env.NODE_ENV === "development" ? message : undefined);
    }

    return null;
}
