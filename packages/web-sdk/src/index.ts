import { storeClickId, retrieveClickId, hasDedupFlag, setDedupFlag } from "./storage.js"
import { sendConversion } from "./transport.js"
import type { AdscrushConfig, ConversionConfig } from "./types.js"

let _clickId: string | null = null
let _config: AdscrushConfig | null = null

/**
 * Read click_id from URL params and persist to cookie + localStorage.
 */
export function initializeUrlParam(
  paramName = "click_id",
  options?: { cookieDomain?: string; cookieExpiry?: number }
): string | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const clickId = params.get(paramName)

    if (clickId) {
      _clickId = clickId
      storeClickId(clickId, options?.cookieExpiry, options?.cookieDomain)
    } else {
      _clickId = retrieveClickId()
    }

    return _clickId
  } catch {
    return null
  }
}

/**
 * Initialize the SDK with a configuration.
 */
export function init(config: AdscrushConfig): void {
  _config = config
  initializeUrlParam(config.paramName ?? "click_id", {
    cookieDomain: config.cookieDomain,
    cookieExpiry: config.cookieExpiry,
  })
}

/**
 * Track a conversion event.
 * Returns a promise that always resolves (never rejects, to avoid breaking host page).
 */
export async function trackConversion(
  config: ConversionConfig & { domain?: string }
): Promise<boolean> {
  try {
    const clickId = _clickId ?? retrieveClickId()
    if (!clickId) return false

    const domain = config.domain ?? _config?.domain
    if (!domain) return false

    const event = config.event ?? "conversion"

    // Dedup check
    if (hasDedupFlag(clickId, event)) return true

    const success = await sendConversion(domain, {
      click_id: clickId,
      event,
      payout: config.payout,
      sale_amount: config.saleAmount,
      currency: config.currency,
    })

    if (success) {
      setDedupFlag(clickId, event)
    }

    return success
  } catch {
    return false
  }
}

/**
 * Get the current click_id (if available).
 */
export function getClickId(): string | null {
  return _clickId ?? retrieveClickId()
}

export type { AdscrushConfig, ConversionConfig } from "./types.js"
