import { treaty } from "@elysiajs/eden"
import { env } from "@/env"
import type { AppType } from "@adscrush/api/types"

const baseUrl = env.NEXT_PUBLIC_API_URL

export const api = treaty<AppType>(baseUrl, {
  fetch: {
    credentials: "include",
  },
}).api.v1
