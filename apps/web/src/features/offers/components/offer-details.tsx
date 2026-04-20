"use client"

import { Badge } from "@adscrush/ui/components/badge"
import { Button } from "@adscrush/ui/components/button"
import { Card, CardContent } from "@adscrush/ui/components/card"
import { Skeleton } from "@adscrush/ui/components/skeleton"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@adscrush/ui/components/tabs"
import { toast } from "@adscrush/ui/sonner"
import {
  IconDots,
  IconExternalLink,
  IconHome,
  IconLink,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import { useOffer, useUpdateOffer } from "../queries"
import { OfferAffiliatesTab } from "./offer-affiliates-tab"
import { OfferFallbackTab } from "./offer-fallback-tab"
import { OfferForm } from "./offer-form"

interface OfferDetailsProps {
  id: string
}

export function OfferDetails({ id }: OfferDetailsProps) {
  const { data: result, isLoading } = useOffer(id)
  const updateOffer = useUpdateOffer()
  const offer = result?.data

  const handleUpdate = async (data: any) => {
    try {
      await updateOffer.mutateAsync({ id, data })
      toast.success("Offer updated successfully")
    } catch (e: any) {
      toast.error(e.message || "Failed to update offer")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!offer) {
    return <div>Offer not found</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              {offer.id} - {offer.name}
            </h1>
            <Badge variant="outline" className="uppercase">
              {offer.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={offer.offerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Preview <IconExternalLink className="ml-2 size-4" />
              </a>
            </Button>
            <Button size="sm">Options</Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage and monitor details for {offer.name}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b p-0"
        >
          <div className="flex items-center gap-6">
            <TabsTrigger
              value="home"
              className="rounded-none bg-transparent py-3 data-active:after:opacity-100"
            >
              <IconHome className="size-4" /> HOME
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className="rounded-none bg-transparent py-3 data-active:after:opacity-100"
            >
              <IconSettings className="size-4" /> GENERAL
            </TabsTrigger>

            <TabsTrigger
              value="affiliates"
              className="rounded-none bg-transparent py-3 data-active:after:opacity-100"
            >
              <IconUsers className="size-4" /> AFFILIATES
            </TabsTrigger>
            <TabsTrigger
              value="fallback"
              className="rounded-none bg-transparent py-3 data-active:after:opacity-100"
            >
              <IconLink className="size-4" /> FALLBACK / INTEGRATION
            </TabsTrigger>
            <TabsTrigger
              value="more"
              className="rounded-none bg-transparent py-3 data-active:after:opacity-100"
            >
              <IconDots className="size-4" /> MORE
            </TabsTrigger>
          </div>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="home">
            <Card>
              <CardContent className="pt-6">
                Home content for {offer.name}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="general">
            <OfferForm
              initialData={offer}
              onSubmit={handleUpdate}
              isPending={updateOffer.isPending}
              submitLabel="Save Changes"
            />
          </TabsContent>

          <TabsContent value="affiliates">
            <OfferAffiliatesTab offer={offer as any} />
          </TabsContent>
          <TabsContent value="fallback">
            <OfferFallbackTab
              offer={offer as any}
              onSubmit={handleUpdate}
              isPending={updateOffer.isPending}
            />
          </TabsContent>
          <TabsContent value="more">
            <Card>
              <CardContent className="pt-6">
                Additional settings for {offer.name}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
