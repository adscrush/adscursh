"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { DetailedPerformanceItem } from "../types"
import { formatCurrency, formatCompactNumber } from "@/features/dashboard/utils"
import { Badge } from "@adscrush/ui/components/badge"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@adscrush/ui/components/tooltip"

export const detailedReportsColumns: ColumnDef<DetailedPerformanceItem>[] = [
  {
    accessorKey: "offerId",
    header: "OfferID",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex max-w-[200px] flex-col">
              <Link
                href={`/offers/${row.original.offerId}`}
                className="truncate text-[11px] leading-tight font-medium text-primary hover:underline"
              >
                {row.original.offerId} ~ {row.original.offerName}
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent className="border-border bg-background shadow-xl">
            <span className="text-[10px]">
              {row.original.offerId} ~ {row.original.offerName}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "affiliateName",
    header: "Affiliate",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex max-w-[200px] flex-col">
              <Link
                href={`/affiliates/${row.original.affiliateId}`}
                className="truncate text-[11px] leading-tight font-medium text-primary hover:underline"
              >
                {row.original.affiliateId} ~ {row.original.affiliateName}
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent className="border-border bg-background shadow-xl">
            <span className="text-[10px]">
              {row.original.affiliateId} ~ {row.original.affiliateName}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "clicks",
    header: () => <div className="text-right">GrossClicks</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono text-[11px] font-bold">{formatCompactNumber(row.original.clicks)}</div>
    ),
  },
  {
    accessorKey: "conversions",
    header: () => <div className="text-right">Conversions</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono text-[11px] font-bold">{formatCompactNumber(row.original.conversions)}</div>
    ),
  },
  {
    accessorKey: "revenue",
    header: () => <div className="text-right">AdvertiserPrice</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono text-[11px] font-bold">{formatCurrency(Number(row.original.revenue))}</div>
    ),
  },
  {
    accessorKey: "payout",
    header: () => <div className="text-right whitespace-nowrap">AffiliatePayout</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono text-[11px] font-bold">{formatCurrency(Number(row.original.payout))}</div>
    ),
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: () => (
      <span className="font-mono text-[10px] text-muted-foreground uppercase">USD</span>
    ),
  },
  {
    id: "cr",
    header: () => <div className="text-right">CR</div>,
    cell: ({ row }) => {
      const cr = row.original.clicks > 0 ? (row.original.conversions / row.original.clicks) * 100 : 0
      return <div className="text-right font-mono text-[11px] font-bold text-primary">{cr.toFixed(3)} %</div>
    },
  },
  {
    accessorKey: "country",
    header: "GeoCountry",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-sm">🇮🇳</span>
        <span className="text-[11px] font-medium">{row.original.country}</span>
      </div>
    ),
  },
  {
    accessorKey: "lpName",
    header: "LandingPage",
    cell: ({ row }) => (
      <span
        className={
          row.original.lpName === "default_offer_url"
            ? "text-[11px] text-muted-foreground italic"
            : "text-[11px] font-medium"
        }
      >
        {row.original.lpName}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => (
      <Badge className="h-5 rounded-none border-none bg-emerald-500/10 px-1.5 py-0 text-[9px] font-bold text-emerald-500 uppercase">
        ACTIVE
      </Badge>
    ),
  },
]
