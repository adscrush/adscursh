import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

export interface DatabaseConfig {
  url?: string;
  max?: number;
}

export function createDatabase(config?: DatabaseConfig) {
  const connectionString = config?.url ?? process.env["DATABASE_URL"];

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(connectionString, {
    max: config?.max ?? 10,
  });

  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDatabase>;
