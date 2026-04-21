"use client"

import {
  ADDITIONAL_MACROS,
  STANDARD_TRACKING_TOKENS,
} from "@adscrush/shared/constants/tokens"
import { Card, CardContent } from "@adscrush/ui/components/card"
import { OfferDetail } from "../queries"

interface OfferTokensTabProps {
  offer: OfferDetail
}

export function OfferTokensTab({}: OfferTokensTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                Standard Tracking Tokens
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {STANDARD_TRACKING_TOKENS.map((token) => (
                  <TokenItem
                    key={token.label}
                    label={token.label}
                    placeholder={token.placeholder}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-dashed pt-4">
              <h3 className="mb-4 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                Additional Macros
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ADDITIONAL_MACROS.map((token) => (
                  <TokenItem
                    key={token.label}
                    label={token.label}
                    placeholder={token.placeholder}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TokenItem({
  label,
  placeholder,
}: {
  label: string
  placeholder: string
}) {
  return (
    <div className="flex h-9 grow overflow-hidden rounded-md border shadow-sm transition-all hover:border-primary/30">
      <div className="flex min-w-[120px] items-center justify-center border-r bg-muted/30 px-3">
        <span className="text-[11px] font-semibold text-foreground/80">
          {label}
        </span>
      </div>
      <div className="flex flex-1 items-center bg-transparent px-3">
        <span className="text-[11px] text-muted-foreground italic">
          {placeholder}
        </span>
      </div>
    </div>
  )
}
