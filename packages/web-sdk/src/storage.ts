const COOKIE_NAME = "_ac_cid"
const LS_KEY = "_adscrush_click_id"

export function setCookie(
  name: string,
  value: string,
  days: number,
  domain?: string
): void {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    let cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
    if (domain) cookie += `;domain=${domain}`
    document.cookie = cookie
  } catch {
    // silently fail
  }
}

export function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    )
    return match ? decodeURIComponent(match[2]!) : null
  } catch {
    return null
  }
}

export function setLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // silently fail
  }
}

export function getLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function storeClickId(
  clickId: string,
  cookieExpiry = 30,
  cookieDomain?: string
): void {
  setCookie(COOKIE_NAME, clickId, cookieExpiry, cookieDomain)
  setLocalStorage(LS_KEY, clickId)
}

export function retrieveClickId(): string | null {
  return getCookie(COOKIE_NAME) ?? getLocalStorage(LS_KEY)
}

export function setDedupFlag(clickId: string, event: string): void {
  setLocalStorage(`_ac_dedup_${clickId}_${event}`, "1")
}

export function hasDedupFlag(clickId: string, event: string): boolean {
  return getLocalStorage(`_ac_dedup_${clickId}_${event}`) === "1"
}
