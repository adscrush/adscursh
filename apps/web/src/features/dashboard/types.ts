export type DashboardPeriod = "1w" | "1m" | "3m" | "custom"

export interface CustomerSegment {
  segment: string
  count: number
  trend: number
  color: string
  share: number
}

export interface GeographyItem {
  countryCode: string
  countryName: string
  flag: string
  total: number
  genderBreakdown?: {
    men: number
    women: number
    other: number
  }
  lat: number
  lng: number
}

export interface DashboardSummary {
  totalRevenue: number
  totalPayout: number
  conversionRate: number
  activeOffers: number
  totalConversions: number
  totalClicks: number
  currency: string
}

export interface DashboardTrends {
  revenueChange: number
  conversionsChange: number
  activeOffersChange: number
  clicksChange: number
  conversionRateChange: number
  revenueComparisons: {
    "4w": number
    "13w": number
    "12m": number
  }
}

export interface RevenuePeriod {
  period: string
  revenue: number
  clicks: number
  conversions: number
}

export interface ActiveOfferItem {
  id: string
  name: string
  category: string
  status: string
  conversions: number
  revenue: number
  lastConversion: string | null
}

export interface DashboardResponse {
  summary: DashboardSummary
  trends: DashboardTrends
  revenueByPeriod: RevenuePeriod[]
  customerSegments: CustomerSegment[]
  geography: GeographyItem[]
  activeOffersList: ActiveOfferItem[]
}
