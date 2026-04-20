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
import { useAffiliateSearch } from "@/features/search/queries"

interface AffiliateSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function AffiliateSelect({
  value,
  onValueChange,
  placeholder = "Select affiliate...",
  disabled,
}: AffiliateSelectProps) {
  const [q, setQ] = React.useState("")

  const [debouncedQuery, debouncer] = useDebouncedValue(
    q,
    { wait: 300 },
    (state) => ({ isPending: state.isPending })
  )

  const {
    data: affiliatesResult,
    isLoading: isQueryLoading,
    isFetching,
  } = useAffiliateSearch(debouncedQuery)

  const affiliates = affiliatesResult ?? []
  const isLoading = isQueryLoading || debouncer.state.isPending || isFetching

  const selectedAffiliate = React.useMemo(() => {
    return affiliates.find((aff) => aff.id === value)
  }, [affiliates, value])

  return (
    <Combobox
      autoHighlight
      value={value}
      onValueChange={(val) => {
        if (typeof val === "string") onValueChange(val)
      }}
      disabled={disabled}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            className="h-9 w-full justify-between font-normal"
            disabled={disabled}
          >
            {selectedAffiliate ? (
              <span className="truncate">{selectedAffiliate.name}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      ></ComboboxTrigger>
      <ComboboxContent className="w-(--radix-popover-trigger-width) p-0">
        <ComboboxInput
          placeholder="Search affiliates..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <ComboboxList>
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && affiliates.length === 0 && (
            <ComboboxEmpty>No affiliate found.</ComboboxEmpty>
          )}
          {!isLoading &&
            affiliates.map((aff) => (
              <ComboboxItem key={aff.id} value={aff.id}>
                <div className="flex flex-col">
                  <span className="truncate text-xs font-medium">
                    {aff.name}
                  </span>
                  {aff.email && (
                    <span className="truncate text-[10px] text-muted-foreground">
                      {aff.email}
                    </span>
                  )}
                </div>
              </ComboboxItem>
            ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
