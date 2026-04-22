"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency, formatTrend } from "../utils"
import type { RevenuePeriod } from "../types"
import { cn } from "@adscrush/ui/lib/utils"

interface RevenueChartProps {
  data: RevenuePeriod[]
  currentTotal: number
  trend: number
  comparisons: {
    "4w": number
    "13w": number
    "12m": number
  }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const revenue = payload[0]?.value ?? 0
    return (
      <div className="rounded-none bg-background border px-3 py-2 text-sm shadow-sm">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold">{formatCurrency(revenue)}</p>
      </div>
    )
  }
  return null
}

export function RevenueChart({ data, currentTotal, trend, comparisons }: RevenueChartProps) {
  const formattedData = useMemo(() => {
    return data.map((d) => {
      const date = new Date(d.period)
      const label = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
      return { ...d, label }
    })
  }, [data])

  const trendInfo = formatTrend(trend)
  const isPositive = trend >= 0

  return (
    <div className="bg-background p-6 h-full">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Sales Revenue</p>
          <h3 className="mt-1 text-4xl font-bold tracking-tight">{formatCurrency(currentTotal)}</h3>
          <div className="mt-2 flex items-center gap-1 text-sm font-medium">
            <span className={cn(isPositive ? "text-emerald-500" : "text-rose-500")}>
              {trendInfo.formatted}
            </span>
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            )}
            <span className="text-muted-foreground ml-1">vs Last month</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Object.entries(comparisons).map(([key, val]) => {
            const compTrend = formatTrend(val)
            const isCompPositive = val >= 0
            return (
              <div key={key} className="flex items-center gap-2 rounded-none border bg-muted/30 px-3 py-1.5 text-xs font-medium">
                <span className="text-muted-foreground">{key}</span>
                <div className={cn("flex items-center gap-0.5", isCompPositive ? "text-emerald-500" : "text-rose-500")}>
                  {isCompPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{compTrend.formatted}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-10 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.8} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10, fontWeight: 500 }} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
            <ReferenceLine
              y={currentTotal}
              stroke="currentColor"
              strokeDasharray="4 4"
              strokeOpacity={0.2}
            />
            <Bar 
              dataKey="revenue" 
              radius={0} 
              className="fill-foreground/90"
              style={{ fill: 'url(#barGradient)' } as any}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
