"use client"

import { env } from "@/env"
import { Badge } from "@adscrush/ui/components/badge"
import { Button } from "@adscrush/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adscrush/ui/components/dialog"
import { Switch } from "@adscrush/ui/components/switch"
import { toast } from "@adscrush/ui/sonner"
import { IconCheck, IconCopy, IconMail, IconShare } from "@tabler/icons-react"
import * as React from "react"
import { OfferDetail } from "../queries"

interface AffiliateInfo {
  affiliateId: string
  affiliateName: string
}

interface OfferAffiliateTrackingDialogProps {
  offer: OfferDetail
  affiliate: AffiliateInfo
  children: React.ReactNode
}

export function OfferAffiliateTrackingDialog({ offer, affiliate, children }: OfferAffiliateTrackingDialogProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)
  const [showDescription, setShowDescription] = React.useState(true)
  const [showLandingPages, setShowLandingPages] = React.useState(true)

  const baseUrl = env.NEXT_PUBLIC_TRACKING_DOMAIN

  const generateUrl = (moValue: string = "r") => {
    return `${baseUrl}/c?o=${offer.id}&a=${affiliate.affiliateId}&aff_click_id={replace_it}&sub_aff_id={replace_it}&mo=${moValue}`
  }

  const trackingUrls = React.useMemo(() => {
    const urls = [
      {
        name: "Random",
        url: generateUrl("r"),
      },
    ]

    if (showLandingPages && offer.landingPages && offer.landingPages.length > 0) {
      offer.landingPages.forEach((lp) => {
        urls.push({
          name: lp.name,
          url: generateUrl(lp.name.toLowerCase().replace(/\s+/g, "")),
        })
      })
    }

    return urls
  }, [offer, affiliate, showLandingPages])

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success("Tracking link copied to clipboard")
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger nativeButton={false}>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <IconShare className="size-5" /> Affiliates Tracking URL
            </DialogTitle>
            <DialogDescription>Generate and share tracking links for this affiliate.</DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Select Offer</p>
                <div className="rounded-md border bg-muted/20 p-2 text-xs font-medium">
                  {offer.id} ~ {offer.name}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Select Affiliate</p>
                <div className="rounded-md border bg-muted/20 p-2 text-xs font-medium">
                  {affiliate.affiliateId} ~ {affiliate.affiliateName}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Tracking URL</p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="xs" className="h-6 gap-1 text-[10px]">
                    <IconMail className="size-3" /> Email
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-1 font-mono text-[11px] leading-relaxed break-all">
                {trackingUrls.map((item, index) => (
                  <div
                    key={index}
                    className="group relative border-b border-dashed border-muted-foreground/20 p-4 last:border-0"
                  >
                    {showDescription && (
                      <p className="mb-2 text-muted-foreground">
                        Offer ID - {offer.id}, Affiliate ID - {affiliate.affiliateId}, LandingPage : {item.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <p className={showDescription ? "border-t border-dashed border-muted-foreground/30 pt-2" : ""}>
                        Click URL : <span className="text-primary">{item.url}</span>
                      </p>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="size-8 shrink-0"
                        onClick={() => copyToClipboard(item.url, index)}
                      >
                        {copiedIndex === index ? (
                          <IconCheck className="size-4 text-green-600" />
                        ) : (
                          <IconCopy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <ToggleItem label="Description" checked={showDescription} onCheckedChange={setShowDescription} />
            <ToggleItem label="Landing Pages" checked={showLandingPages} onCheckedChange={setShowLandingPages} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ToggleItem({
  label,
  checked,
  onCheckedChange,
  badge,
}: {
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  badge?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Switch size="sm" checked={checked} onCheckedChange={onCheckedChange} />
        <span className="text-[11px] font-medium whitespace-nowrap">
          {label.replace(" NEW", "")}{" "}
          {badge && (
            <Badge className="h-3.5 border-none bg-yellow-400 px-1 text-[8px] font-bold text-black">{badge}</Badge>
          )}
        </span>
      </div>
    </div>
  )
}
