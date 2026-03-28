import { createAuth } from "@adscrush/auth"
import { db } from "./db"

export const auth = createAuth({
  database: db
})
