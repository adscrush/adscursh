"use client"

import * as React from "react"
import { useCreateOffer } from "../queries"
import { toast } from "@adscrush/ui/sonner"
import { useRouter } from "next/navigation"
import { OfferForm } from "./offer-form"
import { CreateOfferInput } from "@adscrush/shared/validators/offer.schema"

export function CreateOfferWizard() {
  const router = useRouter()
  const createOffer = useCreateOffer()

  const onSubmit = async (data: CreateOfferInput) => {
    try {
      await createOffer.mutateAsync(data)
      toast.success("Offer created successfully")
      router.push("/offers")
    } catch (e: any) {
      toast.error(e.message || "Failed to create offer")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <OfferForm
        onSubmit={onSubmit}
        isPending={createOffer.isPending}
        submitLabel="Create Offer"
      />
    </div>
  )
}
