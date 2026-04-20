import { PageHeader } from "@/components/common/page-header"
import { CreateOfferWizard } from "@/features/offers/components/create-offer-wizard"
import { Suspense } from "react"

export default function CreateOfferPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Create Offer"
        description="Add a new offer to your network"
      />
      <div className="flex-1 pb-8">
        <Suspense fallback={<div>Loading...</div>}>
          <CreateOfferWizard />
        </Suspense>
      </div>
    </div>
  )
}
