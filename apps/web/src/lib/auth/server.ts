import { createAuth } from "@adscrush/auth"
import { db } from "../db"
import { env } from "@/env"

export const auth = createAuth({
  db: db,
  secret: env.BETTER_AUTH_SECRET,
})
