"use client"

import { Card, CardContent } from "@adscrush/ui/components/card"
import { OfferDetail } from "../queries"

interface OfferTokensTabProps {
  offer: OfferDetail
}

export function OfferTokensTab({}: OfferTokensTabProps) {
  const tokens = [
    { label: "aff_click_id", placeholder: "{replace_it}" },
    { label: "sub_aff_id", placeholder: "{replace_it}" },
    { label: "aff_sub1", placeholder: "{replace_it}" },
    { label: "aff_sub2", placeholder: "{replace_it}" },
    { label: "aff_sub3", placeholder: "{replace_it}" },
    { label: "aff_sub4", placeholder: "{replace_it}" },
    { label: "aff_sub5", placeholder: "{replace_it}" },
    { label: "aff_sub6", placeholder: "{replace_it}" },
    { label: "aff_sub7", placeholder: "{replace_it}" },
    { label: "aff_sub8", placeholder: "{replace_it}" },
    { label: "aff_sub9", placeholder: "{replace_it}" },
    { label: "aff_sub10", placeholder: "{replace_it}" },
    { label: "source", placeholder: "{replace_it}" },
  ]

  const additionalTokens = [
    { label: "{click_id}", placeholder: "System Click ID (UUID)" },
    { label: "{offer_id}", placeholder: "Offer ID" },
    { label: "{affiliate_id}", placeholder: "Affiliate ID" },
    { label: "{payout}", placeholder: "Payout Amount" },
    { label: "{revenue}", placeholder: "Revenue Amount" },
    { label: "{currency}", placeholder: "Currency" },
    { label: "{event}", placeholder: "Goal Event Name" },
  ]

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
                {tokens.map((token) => (
                  <TokenItem key={token.label} label={token.label} placeholder={token.placeholder} />
                ))}
              </div>
            </div>

            <div className="border-t border-dashed pt-4">
              <h3 className="mb-4 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                Additional Macros
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {additionalTokens.map((token) => (
                  <TokenItem key={token.label} label={token.label} placeholder={token.placeholder} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TokenItem({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="flex h-9 grow overflow-hidden rounded-md border shadow-sm transition-all hover:border-primary/30">
      <div className="flex min-w-[120px] items-center justify-center border-r bg-muted/30 px-3">
        <span className="text-[11px] font-semibold text-foreground/80">{label}</span>
      </div>
      <div className="flex flex-1 items-center bg-transparent px-3">
        <span className="text-[11px] text-muted-foreground italic">{placeholder}</span>
      </div>
    </div>
  )
}
