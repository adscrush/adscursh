import { createDatabase } from "@adscrush/db"

export const db = createDatabase({
  url: process.env["DATABASE_URL"],
})
