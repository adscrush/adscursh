"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@adscrush/ui/components/popover"
import { cn } from "@adscrush/ui/lib/utils"
import * as React from "react"

const TOKENS = [
  { label: "Transaction ID", value: "{tid}" },
  { label: "Click ID", value: "{clickid}" },
  { label: "Affiliate ID", value: "{aff_id}" },
  { label: "Sub 1", value: "{sub1}" },
  { label: "Sub 2", value: "{sub2}" },
  { label: "Sub 3", value: "{sub3}" },
  { label: "Source", value: "{source}" },
  { label: "Campaign", value: "{campaign}" },
]

interface TokenSelectorProps {
  onSelect: (token: string) => void
  className?: string
}

export function TokenSelector({ onSelect, className }: TokenSelectorProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary",
            className
          )}
        >
          <span className="flex size-3.5 items-center justify-center rounded-xs border text-[10px]">+</span> Add Token
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        <div className="flex flex-col gap-0.5">
          {TOKENS.map((token) => (
            <button
              key={token.value}
              type="button"
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] hover:bg-muted"
              onClick={() => {
                onSelect(token.value)
                setOpen(false)
              }}
            >
              <span>{token.label}</span>
              <span className="font-mono text-muted-foreground">{token.value}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
