const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

export async function api<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...init } = options

  let url = `${API_URL}${path}`
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, String(value))
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      (error as { error?: string }).error ?? `API error: ${response.status}`
    )
  }

  return response.json() as Promise<T>
}

export function apiGet<T = unknown>(
  path: string,
  params?: Record<string, string | number | undefined>
) {
  return api<T>(path, { params })
}

export function apiPost<T = unknown>(path: string, body: unknown) {
  return api<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function apiPut<T = unknown>(path: string, body: unknown) {
  return api<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export function apiDelete<T = unknown>(path: string) {
  return api<T>(path, { method: "DELETE" })
}
