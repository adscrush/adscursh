import { env } from "@/env"
import type { AppType } from "@adscrush/api/types"
import { treaty } from "@elysiajs/eden"
import superjson from "superjson"

const baseUrl = env.NEXT_PUBLIC_API_URL

export const api = treaty<AppType>(baseUrl, {
  fetch: {
    credentials: "include",
  },
  parseDate: true,
  onResponse: async (response) => {
    const json = await response.json()
    return superjson.deserialize(json)
  },
}).api.v1
