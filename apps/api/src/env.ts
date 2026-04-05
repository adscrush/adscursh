/* eslint-disable node/no-process-env */
import { config } from "dotenv"
import { expand } from "dotenv-expand"
import path from "node:path"
import { z } from "zod"

expand(
  config({
    path: path.resolve(
      process.cwd(),
      process.env.NODE_ENV === "test" ? ".env.test" : ".env"
    ),
  })
)

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]),

  //   auth & db
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  //   public urls
  PUBLIC_FRONTEND_URL: z.url().default("https://app.adscrush.local"),
  PUBLIC_API_URL: z.url().default("https://api.adscrush.local"),

  // Social Login
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // SMTP Mailing
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().transform((v) => parseInt(v, 10)),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.email(),
})

export type env = z.infer<typeof EnvSchema>

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env)

if (error) {
  console.error("❌ Invalid env:")
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2))
  process.exit(1)
}

export default env!

export function parseEnv(data: any) {
  const { data: env, error } = EnvSchema.safeParse(data)

  if (error) {
    const errorMessage = `❌ Invalid env - ${Object.entries(
      error.flatten().fieldErrors
    )
      .map(([key, errors]) => `${key}: ${errors.join(",")}`)
      .join(" | ")}`
    throw new Error(errorMessage)
  }

  return env
}
