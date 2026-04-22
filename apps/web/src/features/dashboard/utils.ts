export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatTrend(value: number): { sign: "+" | "-"; value: number; formatted: string } {
  const sign = value >= 0 ? "+" : "-"
  const absValue = Math.abs(value)
  return {
    sign,
    value: absValue,
    formatted: `${sign}${absValue.toFixed(1)}%`,
  }
}

export function getPeriodLabel(period: string, dateString: string): string {
  if (period === "1w") {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }
  if (period === "1m" || period === "3m") {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  return dateString
}
