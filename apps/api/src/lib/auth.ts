import { createAuth } from "@adscrush/auth"
import { db } from "./db"

export const auth = createAuth({
  db: db,
  basePath: "/api/v1/auth",
  baseURL: process.env["BETTER_AUTH_URL"] ?? "http://localhost:8989",
  secret: process.env["BETTER_AUTH_SECRET"] ?? "please-change-this-secret",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:8989",
    "https://app.adscrush.local",
    "https://api.adscrush.local",
  ]
})
