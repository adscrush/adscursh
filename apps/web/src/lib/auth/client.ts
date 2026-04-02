"use client"

import { createAuthClient } from "@adscrush/auth/client"

export const authClient = createAuthClient({
  baseURL: "https://api.adscrush.local",
  basePath: "/api/v1/auth",
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
} = authClient
