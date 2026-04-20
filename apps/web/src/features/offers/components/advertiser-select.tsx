"use client"

import { Button } from "@adscrush/ui/components/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@adscrush/ui/components/combobox"
import { IconLoader2, IconSelector } from "@tabler/icons-react"
import { useDebouncedValue } from "@tanstack/react-pacer"
import * as React from "react"
import { useAdvertiserSearch } from "@/features/search/queries"

interface AdvertiserSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function AdvertiserSelect({
  value,
  onValueChange,
  placeholder = "Select advertiser...",
  disabled,
}: AdvertiserSelectProps) {
  const [q, setQ] = React.useState("")

  const [debouncedQuery, debouncer] = useDebouncedValue(
    q,
    { wait: 500 },
    (state) => ({ isPending: state.isPending })
  )

  const {
    data: advertisers = [],
    isLoading: isQueryLoading,
    isFetching,
  } = useAdvertiserSearch(debouncedQuery)

  const isLoading = isQueryLoading || debouncer.state.isPending || isFetching

  const selectedAdvertiser = React.useMemo(() => {
    return advertisers.find((a) => a.id === value)
  }, [advertisers, value])

  return (
    <Combobox
      autoHighlight
      items={advertisers}
      value={selectedAdvertiser ?? null}
      itemToStringValue={(adv) => adv.name}
      onValueChange={(adv) => onValueChange(adv?.id ?? "")}
      disabled={disabled}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            {selectedAdvertiser ? (
              <span className="truncate">{selectedAdvertiser.name}</span>
            ) : (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            )}
            {isLoading ? (
              <IconLoader2 className="ml-2 size-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <IconSelector className="ml-2 size-3.5 shrink-0 text-muted-foreground" />
            )}
          </Button>
        }
      />
      <ComboboxContent className="min-w-0">
        <div className="w-full p-1.5">
          <ComboboxInput
            className="min-w-0 rounded-md"
            placeholder="Search advertiser..."
            showTrigger={false}
            showClear={false}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <ComboboxEmpty>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <IconLoader2 className="size-3 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            "No results found."
          )}
        </ComboboxEmpty>
        <ComboboxList>
          {(adv: any) => (
            <ComboboxItem key={adv.id} value={adv}>
              <span className="truncate text-xs font-medium">
                {adv.name}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
