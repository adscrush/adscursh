"use client"

import { createAuthClient } from "@adscrush/auth/client"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
})

export const { signIn, signUp, signOut, useSession } = authClient
