import type { NextConfig } from "next"
import { fileURLToPath } from "node:url"
import { createJiti } from "jiti"
const jiti = createJiti(fileURLToPath(import.meta.url))

jiti.import("./src/env.ts")

const nextConfig: NextConfig = {
  transpilePackages: ["@adscrush/ui", "@adscrush/shared", "@adscrush/auth"],
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:8989",
    "app.adscrush.local",
    "api.adscrush.local",
  ],
  cacheComponents: true,
}

export default nextConfig
