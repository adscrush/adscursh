import { Suspense } from "react"
import { OfferDetails } from "@/features/offers/components/offer-details"

interface OfferPageProps {
  params: Promise<{ id: string }>
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Suspense fallback={<div>Loading offer details...</div>}>
        <OfferDetails id={id} />
      </Suspense>
    </div>
  )
}
