"use server"

import { revalidateTag } from "next/cache"

export async function updateEmployee(input: { id: string; department?: string; status?: "active" | "inactive" | "suspended" }) {
  try {
    await revalidateTag("employees")
    await revalidateTag("employee-status-counts")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    console.error("Update employee error:", err)
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to update employee",
    }
  }
}
