import { createJiti } from "jiti"
import type { NextConfig } from "next"
import { fileURLToPath } from "node:url"
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
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
