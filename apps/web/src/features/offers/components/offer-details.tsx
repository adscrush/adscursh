"use client"

import * as React from "react"
import { useOffer, useUpdateOffer } from "../queries"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@adscrush/ui/components/tabs"
import { Card, CardContent } from "@adscrush/ui/components/card"
import {
  IconHome,
  IconSettings,
  IconTarget,
  IconBrush,
  IconUsers,
  IconLink,
  IconDots,
  IconExternalLink,
} from "@tabler/icons-react"
import { Badge } from "@adscrush/ui/components/badge"
import { Skeleton } from "@adscrush/ui/components/skeleton"
import { Button } from "@adscrush/ui/components/button"
import { OfferForm } from "./offer-form"
import { toast } from "@adscrush/ui/sonner"
import { CreateOfferInput } from "@adscrush/shared/validators/offer.validator"

interface OfferDetailsProps {
  id: string
}

export function OfferDetails({ id }: OfferDetailsProps) {
  const { data: result, isLoading } = useOffer(id)
  const updateOffer = useUpdateOffer()
  const offer = result?.data

  const handleUpdate = async (data: CreateOfferInput) => {
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
              <a href={offer.offerUrl} target="_blank" rel="noopener noreferrer">
                Preview <IconExternalLink className="ml-2 size-4" />
              </a>
            </Button>
            <Button size="sm">Options</Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage and monitor details for {offer.name}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList variant="line" className="w-full justify-start border-b rounded-none h-auto p-0 gap-6 overflow-x-auto">
          <TabsTrigger value="home" className="data-active:after:opacity-100 py-3 rounded-none bg-transparent">
            <IconHome className="size-4" /> HOME
          </TabsTrigger>
          <TabsTrigger value="general" className="data-active:after:opacity-100 py-3 rounded-none bg-transparent">
            <IconSettings className="size-4" /> GENERAL
          </TabsTrigger>
          <TabsTrigger value="targeting" className="data-active:after:opacity-100 py-3 rounded-none bg-transparent">
            <IconTarget className="size-4" /> TARGETING
          </TabsTrigger>
          <TabsTrigger value="creatives" className="data-active:after:opacity-100 py-3 rounded-none bg-transparent">
            <IconBrush className="size-4" /> CREATIVES
          </TabsTrigger>
          <TabsTrigger value="affiliates" className="data-active:after:opacity-100 py-3 rounded-none bg-transparent">
            <IconUsers className="size-4" /> AFFILIATES
          </TabsTrigger>
          <TabsTrigger value="fallback" className="data-active:after:opacity-100 py-3 rounded-none bg-transparent">
            <IconLink className="size-4" /> FALLBACK / INTEGRATION
          </TabsTrigger>
          <TabsTrigger value="more" className="data-active:after:opacity-100 py-3 rounded-none bg-transparent">
            <IconDots className="size-4" /> MORE
          </TabsTrigger>
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
              initialData={offer as any} 
              onSubmit={handleUpdate} 
              isPending={updateOffer.isPending}
              submitLabel="Save Changes"
            />
          </TabsContent>
          <TabsContent value="targeting">
            <Card>
              <CardContent className="pt-6">
                Targeting settings for {offer.name}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="creatives">
            <Card>
              <CardContent className="pt-6">
                Creative assets for {offer.name}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="affiliates">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <IconUsers className="size-5" /> Manage Affiliates
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Search: <Skeleton className="h-8 w-48" />
                  </div>
                </div>
                <div className="border rounded-md p-8 text-center text-muted-foreground">
                  Affiliate management table will be implemented here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="fallback">
            <Card>
              <CardContent className="pt-6">
                Fallback and Integration settings for {offer.name}
              </CardContent>
            </Card>
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
