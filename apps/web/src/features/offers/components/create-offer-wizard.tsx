"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createOfferSchema,
  type CreateOfferInput,
} from "@adscrush/shared/validators/offer.validator"
import { Button } from "@adscrush/ui/components/button"
import { Input } from "@adscrush/ui/components/input"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@adscrush/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@adscrush/ui/components/tabs"
import { Card, CardContent } from "@adscrush/ui/components/card"
import { AdvertiserSelect } from "./advertiser-select"
import { CategorySelect } from "./category-select"
import { useCreateOffer } from "../queries"
import { toast } from "@adscrush/ui/sonner"
import { useRouter } from "next/navigation"
import { IconDeviceFloppy, IconUpload } from "@tabler/icons-react"

export function CreateOfferWizard() {
  const router = useRouter()
  const createOffer = useCreateOffer()

  const form = useForm<CreateOfferInput>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      name: "",
      advertiserId: "",
      categoryId: null,
      status: "active",
      visibility: "public",
      revenueType: "CPC",
      defaultRevenue: "0",
      currency: "INR",
      payoutType: "CPC",
      defaultPayout: "0",
      offerUrl: "",
    },
  })

  const [showLandingPages, setShowLandingPages] = React.useState(false)
  const [landingPages, setLandingPages] = React.useState(
    Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: "",
      type: "Landing",
      url: "",
      affiliate: "Allow",
      weight: "10",
      visibility: "Show",
    }))
  )

  const addLandingPageRow = () => {
    setLandingPages([
      ...landingPages,
      {
        id: Date.now(),
        name: "",
        type: "Landing",
        url: "",
        affiliate: "Allow",
        weight: "10",
        visibility: "Show",
      },
    ])
  }

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation="vertical"
                        data-invalid={fieldState.invalid}
                        className="flex flex-row items-start justify-start gap-2"
                      >
                        <FieldLabel className="w-fit! min-w-40 shrink-0 text-sm font-medium">
                          Offer Name *
                        </FieldLabel>
                        <FieldContent className="flex-1 grow">
                          <Input {...field} placeholder="Offer Name" />
                          <FieldError />
                        </FieldContent>
                      </Field>
                    )}
                  />

                  <Controller
                    name="advertiserId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation="vertical"
                        data-invalid={fieldState.invalid}
                        className="flex flex-row items-start justify-start gap-2"
                      >
                        <FieldLabel className="w-fit! min-w-40 shrink-0 text-sm font-medium">
                          Advertiser *
                        </FieldLabel>
                        <FieldContent className="mr-auto w-fit flex-1">
                          <AdvertiserSelect
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                          <FieldError />
                        </FieldContent>
                      </Field>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <Controller
                    name="categoryId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation="vertical"
                        data-invalid={fieldState.invalid}
                        className="flex flex-row items-start justify-start gap-2"
                      >
                        <FieldLabel className="w-fit! min-w-40 shrink-0 text-sm font-medium">
                          Offer Category
                        </FieldLabel>
                        <FieldContent className="flex-1 grow">
                          <CategorySelect
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FieldContent>
                      </Field>
                    )}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Controller
                  name="offerUrl"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      orientation="vertical"
                      data-invalid={fieldState.invalid}
                      className="flex flex-row items-start justify-start gap-2"
                    >
                      <FieldLabel className="mb-2 w-fit! min-w-40 shrink-0 text-sm font-medium">
                        Offer URL *
                      </FieldLabel>
                      <FieldContent className="flex max-w-full flex-row items-start gap-4">
                        <div className="max-w-4xl flex-1">
                          <textarea
                            {...field}
                            rows={4}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="https://..."
                          />
                          <FieldError />
                        </div>
                        <div className="flex min-w-32 flex-col gap-3 pt-1">
                          {showLandingPages && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-foreground/80 uppercase">
                                Weight
                              </span>
                              <Input
                                className="w-16 text-center"
                                defaultValue="10"
                              />
                            </div>
                          )}
                          <div className="flex flex-col gap-2 text-[11px] font-medium text-muted-foreground">
                            <button
                              type="button"
                              onClick={() =>
                                setShowLandingPages(!showLandingPages)
                              }
                              className={`flex items-center gap-1.5 transition-colors ${showLandingPages ? "text-primary" : "hover:text-primary"}`}
                            >
                              <span className="flex size-3.5 items-center justify-center rounded-xs border text-[10px]">
                                {showLandingPages ? "v" : ">"}
                              </span>{" "}
                              Landing Page
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-1.5 transition-colors hover:text-primary"
                            >
                              <span className="flex size-3.5 items-center justify-center rounded-xs border text-[10px]">
                                #
                              </span>{" "}
                              Tokens
                            </button>
                          </div>
                        </div>
                      </FieldContent>
                    </Field>
                  )}
                />

                {showLandingPages && (
                  <div className="m-0 mt-4">
                    <div className="flex flex-row items-start justify-start gap-2">
                      <div className="w-fit! min-w-40 shrink-0" />
                      <div className="flex-1 grow space-y-4">
                        <div className="max-w-5xl overflow-hidden rounded-md border">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b bg-muted/50">
                              <tr className="font-bold tracking-tight uppercase">
                                <th className="w-40 px-3 py-2">Name</th>
                                <th className="w-32 px-3 py-2">Type</th>
                                <th className="px-3 py-2">Landing Page</th>
                                <th className="w-28 px-3 py-2">Affiliate</th>
                                <th className="w-20 px-3 py-2 text-center">
                                  Weight
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {landingPages.map((lp) => (
                                <tr
                                  key={lp.id}
                                  className="bg-transparent transition-colors hover:bg-muted/30"
                                >
                                  <td className="px-2 py-2">
                                    <Input
                                      className="border-none bg-muted/20 text-xs shadow-none"
                                      placeholder="Name"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <Select defaultValue="Landing">
                                      <SelectTrigger className="border-none text-[11px] shadow-none">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Landing">
                                          Landing
                                        </SelectItem>
                                        <SelectItem value="Pre-landing">
                                          Pre-landing
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="px-2 py-2">
                                    <Input
                                      className="border-none bg-muted/20 text-xs shadow-none"
                                      placeholder="URL"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <Select defaultValue="Allow">
                                      <SelectTrigger className="border-none text-[11px] shadow-none">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Allow">
                                          Allow
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="px-2 py-2">
                                    <Input
                                      className="border-none text-center text-xs shadow-none"
                                      defaultValue="10"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-start">
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={addLandingPageRow}
                            className="h-6 text-primary hover:bg-primary/5"
                          >
                            + Add Another
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Revenue */}

                <div className="space-y-6">
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <Field
                        orientation="vertical"
                        className="flex flex-row items-start justify-start gap-2"
                      >
                        <FieldLabel className="w-fit! min-w-40 shrink-0 text-sm font-medium">
                          Status
                        </FieldLabel>
                        <FieldContent className="flex-1 grow">
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Approve</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>
                    )}
                  />
                </div>
              </div>

              <div className="mt-8">
                <Tabs defaultValue="description">
                  <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                      value="description"
                      className="rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 text-xs font-bold uppercase data-[state=active]:border-primary"
                    >
                      Offer Description
                    </TabsTrigger>
                    <TabsTrigger
                      value="private"
                      className="rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 text-xs font-bold uppercase data-[state=active]:border-primary"
                    >
                      Private Note
                    </TabsTrigger>
                  </TabsList>
                  <div className="mt-4 min-h-[200px] rounded-md border bg-muted/5 p-4">
                    <TabsContent value="description">
                      <Controller
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            value={field.value || ""}
                            className="min-h-[160px] w-full resize-none bg-transparent text-sm outline-none"
                            placeholder="Write offer description..."
                          />
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="private">
                      <Controller
                        name="privateNote"
                        control={form.control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            value={field.value || ""}
                            className="min-h-[160px] w-full resize-none bg-transparent text-sm outline-none"
                            placeholder="Write private notes..."
                          />
                        )}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="gap-2"
            disabled={createOffer.isPending}
          >
            {createOffer.isPending ? (
              "Creating..."
            ) : (
              <>
                Create Offer <IconDeviceFloppy className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
