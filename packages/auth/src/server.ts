import { betterAuth } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";

export interface AuthConfig {
  database: BetterAuthOptions["database"];
  baseURL?: string;
  secret?: string;
  trustedOrigins?: string[];
}

export function createAuth(config: AuthConfig) {
  return betterAuth({
    baseURL: config.baseURL ?? process.env["BETTER_AUTH_URL"],
    secret:
      config.secret ?? process.env["BETTER_AUTH_SECRET"] ?? "default-secret",
    database: drizzleAdapter(config.database, {
      provider: "pg"
    }),
    trustedOrigins: config.trustedOrigins ?? [
      process.env["DASHBOARD_URL"] ?? "http://localhost:3000",
    ],
    user: {
      modelName: "user",
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "employee",
          input: true,
        },
      },
    },
    session: {
      modelName: "session",
    },
    account: {
      modelName: "account",
    },
    verification: {
      modelName: "verification",
    },
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
        clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
        enabled: !!(process.env["GOOGLE_CLIENT_ID"] && process.env["GOOGLE_CLIENT_SECRET"]),
      },
    },
    plugins: [
      openAPI({
        disableDefaultReference: true,
      }),
    ]
  });
}

export type Auth = ReturnType<typeof createAuth>;
