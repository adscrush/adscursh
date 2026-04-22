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
  TRACKING_PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
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
