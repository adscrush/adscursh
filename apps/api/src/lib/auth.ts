import env from "@/env"
import { createAuth } from "@adscrush/auth"
import { db } from "./db"

export const auth = createAuth({
  db: db,
  secret: env.BETTER_AUTH_SECRET,
})
