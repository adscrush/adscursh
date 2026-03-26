export async function sendConversion(
  domain: string,
  data: Record<string, string | undefined>
): Promise<boolean> {
  try {
    const response = await fetch(`${domain}/conversion/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    })
    return response.ok
  } catch {
    return false
  }
}
