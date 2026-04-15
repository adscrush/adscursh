/* ── Helpers ───────────────────────────────────────────────────────── */

export function parseApiError(errorPayload: unknown): string {
  if (!errorPayload) return "An unexpected error occurred"

  // If we passed Eden's error object directly containing `.value`
  const obj = errorPayload as Record<string, unknown>
  console.log(obj)
  const data = (obj.status && obj.value ? obj.value : obj) as Record<
    string,
    unknown
  >

  if (typeof data === "string") return data

  if (data.error) {
    return String(data.error)
  }

  if (data.message) return String(data.message)

  // Debug: log the actual error structure to help diagnose issues
  console.error("API Error payload:", errorPayload)
  console.error("API Error data:", data)

  return "An unexpected error occurred"
}
