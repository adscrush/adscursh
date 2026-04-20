"use client"

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
import {
  IconCheck,
  IconCopy,
  IconMail,
  IconShare,
  IconTarget,
} from "@tabler/icons-react"
import * as React from "react"
import { Offer } from "../queries"

interface OfferAffiliateTrackingDialogProps {
  offer: Offer
  affiliate: any
  children: React.ReactNode
}

export function OfferAffiliateTrackingDialog({
  offer,
  affiliate,
  children,
}: OfferAffiliateTrackingDialogProps) {
  const [copied, setCopy] = React.useState(false)
  const trackingUrl = `https://linktracker.o18.click/c?o=${offer.id}&m=5947&a=${affiliate.affiliateId}&aff_click_id={replace_it}&sub_aff_id={replace_it}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingUrl)
    setCopy(true)
    toast.success("Tracking link copied to clipboard")
    setTimeout(() => setCopy(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger render={<>{children}</>}></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <IconShare className="size-5" /> Affiliates Tracking URL
            </DialogTitle>
            <DialogDescription>
              Generate and share tracking links for this affiliate.
            </DialogDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5">
            <IconTarget className="mr-1 size-3" /> Integration
          </Badge>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Select Offer
                </p>
                <div className="rounded-md border bg-muted/20 p-2 text-xs font-medium">
                  {offer.id} ~ {offer.name}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Select Affiliate
                </p>
                <div className="rounded-md border bg-muted/20 p-2 text-xs font-medium">
                  {affiliate.affiliateId} ~ {affiliate.affiliateName}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Tracking URL
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-6 gap-1 text-[10px]"
                  >
                    <IconMail className="size-3" /> Email
                  </Button>
                </div>
              </div>
              <div className="group relative">
                <div className="rounded-lg border bg-muted/30 p-4 pr-12 font-mono text-[11px] leading-relaxed break-all">
                  <p className="mb-2 text-muted-foreground">
                    Offer ID - {offer.id}, Affiliate ID -{" "}
                    {affiliate.affiliateId}
                  </p>
                  <p className="border-t border-dashed border-muted-foreground/30 pt-2">
                    Click URL :{" "}
                    <span className="text-primary">{trackingUrl}</span>
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="absolute top-2 right-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <IconCheck className="size-4 text-green-600" />
                  ) : (
                    <IconCopy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <ToggleItem label="Impression URL" />
            <ToggleItem label="Description" defaultChecked />
            <ToggleItem label="QR Code" />
            <ToggleItem label="Additional Tokens" defaultChecked />
            <ToggleItem label="Landing Pages" defaultChecked />
            <ToggleItem label="Pre-Landing Pages" />
            <ToggleItem label="Affiliate Default Tokens" />
            <ToggleItem label="Google Ads" />
            <ToggleItem label="Short URL NEW" badge="NEW" />
            <ToggleItem label="Short URL with Params" />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <TokenInput
              label="aff_click_id"
              placeholder="{replace_it}"
              checked
            />
            <TokenInput label="sub_aff_id" placeholder="{replace_it}" checked />
            <TokenInput label="aff_sub1" placeholder="{replace_it}" />
            <TokenInput label="aff_sub2" placeholder="{replace_it}" />
            <TokenInput label="aff_sub3" placeholder="{replace_it}" />
            <TokenInput label="aff_sub4" placeholder="{replace_it}" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ToggleItem({
  label,
  defaultChecked = false,
  badge,
}: {
  label: string
  defaultChecked?: boolean
  badge?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Switch size="sm" defaultChecked={defaultChecked} />
        <span className="text-[11px] font-medium whitespace-nowrap">
          {label.replace(" NEW", "")}{" "}
          {badge && (
            <Badge className="h-3.5 border-none bg-yellow-400 px-1 text-[8px] font-bold text-black">
              {badge}
            </Badge>
          )}
        </span>
      </div>
    </div>
  )
}

function TokenInput({
  label,
  placeholder,
  checked = false,
}: {
  label: string
  placeholder: string
  checked?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        className="size-3.5 rounded border-muted-foreground/30"
        defaultChecked={checked}
      />
      <div className="flex h-8 grow overflow-hidden rounded border">
        <div className="flex min-w-20 items-center justify-center border-r bg-muted/50 px-2">
          <span className="text-[10px] font-medium">{label}</span>
        </div>
        <input
          className="flex-1 bg-transparent px-2 text-[10px] outline-none"
          placeholder={placeholder}
          readOnly
        />
      </div>
    </div>
  )
}
