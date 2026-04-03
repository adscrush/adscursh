import { treaty } from "@elysiajs/eden"
import { env } from "@/env"

const baseUrl = env.NEXT_PUBLIC_API_URL

export const api = treaty(baseUrl, {
  fetch: {
    credentials: "include",
  },
})
