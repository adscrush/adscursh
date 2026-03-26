export interface AdscrushConfig {
  domain: string
  cookieDomain?: string
  cookieExpiry?: number
  paramName?: string
}

export interface ConversionConfig {
  event?: string
  payout?: string
  saleAmount?: string
  currency?: string
}
