"use client"

import { formatCurrency, formatCompactNumber } from "../utils"
import type { ActiveOfferItem } from "../types"
import { Badge } from "@adscrush/ui/components/badge"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@adscrush/ui/lib/utils"

interface ActiveOffersPanelProps {
  offers: ActiveOfferItem[]
}

export function ActiveOffersPanel({ offers }: ActiveOffersPanelProps) {
  return (
    <div className="h-full">
      <div className="border-b px-6 py-4 bg-background">
        <h3 className="text-sm font-bold tracking-tight">Active Offers</h3>
      </div>
      <div className="overflow-x-auto bg-background h-full">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3">Offer</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Revenue</th>
              <th className="px-6 py-3">Clicks</th>
              <th className="px-6 py-3">Conversions</th>
              <th className="px-6 py-3">Last Conv.</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {offers.length > 0 ? (
              offers.map((offer) => (
                <tr key={offer.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4 font-semibold text-foreground">{offer.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{offer.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-1.5 w-1.5 rounded-none", offer.status === "active" ? "bg-emerald-500" : "bg-muted-foreground")} />
                      <Badge variant={offer.status === "active" ? "outline" : "secondary"} className="rounded-none font-bold text-[10px] uppercase tracking-wide border-0 bg-muted/50">
                        {offer.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">{formatCurrency(offer.revenue)}</td>
                  <td className="px-6 py-4 font-medium">{formatCompactNumber(offer.clicks)}</td>
                  <td className="px-6 py-4 font-medium">{formatCompactNumber(offer.conversions)}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {offer.lastConversion ? formatDistanceToNow(new Date(offer.lastConversion), { addSuffix: true }) : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No active offers found for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
