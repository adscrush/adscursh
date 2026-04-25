"use client"

import { Button } from "@adscrush/ui/components/button"
import { Badge } from "@adscrush/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@adscrush/ui/components/select"
import { CalendarDatePicker } from "@adscrush/ui/components/calendar-date-picker"
import { Filter, Play, Sparkles } from "lucide-react"
import { FiltersSheet } from "./filters-sheet"
import { useQueryStates } from "nuqs"
import { performanceSearchParams } from "../validations"
import { startOfDay, endOfDay } from "date-fns"

export function ReportsToolbar() {
  const [params, setParams] = useQueryStates(performanceSearchParams, {
    shallow: false,
  })

  const templates = ["Basic Report", "Offer", "Affiliate", "Country", "Events"]

  const resultOptions = [
    "20",
    "30",
    "50",
    "100",
    "200",
    "500",
    "1000",
    "10000",
    "30000",
    "50000 (csv)",
    "100000 (csv)",
    "200000 (csv)",
    "500000 (csv)",
    "1000000 (csv)",
    "2000000 (csv)",
  ]

  const dateValue = {
    from: params.dateFrom || startOfDay(new Date()),
    to: params.dateTo || endOfDay(new Date()),
  }

  return (
    <div className="flex flex-wrap items-end gap-6 border border-border bg-card/30 p-4">
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
          <Play className="size-2.5 fill-current" /> Templates
        </span>
        <div className="flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="h-6 cursor-pointer rounded-none border-muted/50 bg-muted/20 px-2.5 text-[10px] font-medium transition-all hover:border-primary/50 hover:bg-primary/10"
            >
              {t}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className="flex h-6 cursor-pointer items-center gap-1 rounded-none border-primary/30 bg-primary/20 px-2.5 text-[10px] text-primary"
          >
            <Sparkles className="size-2.5" /> Fraud Fender
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
          <Filter className="size-2.5" /> Period
        </span>
        <CalendarDatePicker
          date={dateValue}
          onDateSelect={(d) =>
            setParams({
              dateFrom: d.from,
              dateTo: d.to,
            })
          }
          className="w-fit max-w-[220px] px-5 text-xs"
          variant={"outline"}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase">Results</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Show</span>
          <Select value={params.limit.toString()} onValueChange={(v) => setParams({ limit: parseInt(v) })}>
            <SelectTrigger className="h-9 w-[120px] rounded-none bg-background font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {resultOptions.map((opt) => (
                <SelectItem key={opt} value={opt.split(" ")[0]!} className="rounded-none text-xs">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="ml-auto flex gap-2">
        <Button
          size="sm"
          className="h-9 gap-2 rounded-none bg-primary/90 px-4 text-[11px] font-bold tracking-wider uppercase hover:bg-primary"
        >
          <Play className="size-3 fill-current" /> Submit
        </Button>
        <FiltersSheet>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 rounded-none border-primary/20 p-0 text-primary hover:bg-primary/5"
          >
            <Filter className="size-4" />
          </Button>
        </FiltersSheet>
      </div>
    </div>
  )
}
