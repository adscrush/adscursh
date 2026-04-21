"use client"

import { URL_TOKENS } from "@adscrush/shared/constants/tokens"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@adscrush/ui/components/popover"
import { cn } from "@adscrush/ui/lib/utils"
import * as React from "react"

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
          <span className="flex size-3.5 items-center justify-center rounded-xs border text-[10px]">
            +
          </span>{" "}
          Add Token
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        <div className="flex flex-col gap-0.5">
          {URL_TOKENS.map((token) => (
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
              <span className="font-mono text-muted-foreground">
                {token.value}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
