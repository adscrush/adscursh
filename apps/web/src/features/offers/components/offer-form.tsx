"use client"

import * as React from "react"
import {
  useForm,
  Controller,
  useFieldArray,
  type SubmitHandler,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createOfferSchema,
  type CreateOfferInput,
} from "@adscrush/shared/validators/offer.schema"
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
import { IconDeviceFloppy } from "@tabler/icons-react"
import { TokenSelector } from "./token-selector"

interface OfferFormProps {
  initialData?: Partial<CreateOfferInput>
  onSubmit: SubmitHandler<CreateOfferInput>
  isPending: boolean
  submitLabel?: string
}

export function OfferForm({
  initialData,
  onSubmit,
  isPending,
  submitLabel = "Save Changes",
}: OfferFormProps) {
  const form = useForm({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      advertiserId: initialData?.advertiserId ?? "",
      categoryId: initialData?.categoryId ?? null,
      status:
        (initialData?.status as "active" | "inactive" | "paused" | "expired") ??
        "active",
      visibility:
        (initialData?.visibility as "public" | "private" | "exclusive") ??
        "public",
      revenueType: initialData?.revenueType ?? "CPC",
      defaultRevenue: initialData?.defaultRevenue ?? "0",
      currency: initialData?.currency ?? "INR",
      payoutType: initialData?.payoutType ?? "CPC",
      defaultPayout: initialData?.defaultPayout ?? "0",
      offerUrl: initialData?.offerUrl ?? "",
      allowMultiConversion: initialData?.allowMultiConversion ?? false,
      targetGeo: initialData?.targetGeo ?? null,
      fallbackUrl: initialData?.fallbackUrl ?? null,
      logo: initialData?.logo ?? null,
      description: initialData?.description ?? null,
      privateNote: initialData?.privateNote ?? null,
      startDate: initialData?.startDate ?? null,
      endDate: initialData?.endDate ?? null,
      postbackType:
        (initialData?.postbackType as "pixel" | "postback") ?? "pixel",
      whitelistPostbackReferralDomain:
        initialData?.whitelistPostbackReferralDomain ?? null,
      landingPages: initialData?.landingPages?.length
        ? initialData.landingPages
        : [
            { name: "", url: "", weight: 10, status: "active" as const },
            { name: "", url: "", weight: 10, status: "active" as const },
            { name: "", url: "", weight: 10, status: "active" as const },
          ],
    },
  })

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "landingPages",
  })

  const [showLandingPages, setShowLandingPages] = React.useState(false)

  const [activeField, setActiveField] = React.useState<{
    onChange: (val: string) => void
    element: HTMLTextAreaElement | HTMLInputElement | null
  } | null>(null)

  const addLandingPageRow = () => {
    append({ name: "", url: "", weight: 10, status: "active" })
  }

  const insertToken = (
    value: string,
    onChange: (val: string) => void,
    element: HTMLTextAreaElement | HTMLInputElement | null
  ) => {
    if (!element) return

    const currentValue = element.value
    const start = element.selectionStart || 0
    const end = element.selectionEnd || 0
    const newValue =
      currentValue.substring(0, start) + value + currentValue.substring(end)

    onChange(newValue)

    // Set cursor position after the inserted token
    setTimeout(() => {
      element.focus()
      element.setSelectionRange(start + value.length, start + value.length)
    }, 0)
  }

  return (
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
                  render={({ field }) => (
                    <Field
                      orientation="vertical"
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
                          ref={(el) => {
                            field.ref(el)
                            ;(field as any).element = el
                          }}
                          onFocus={() =>
                            setActiveField({
                              onChange: field.onChange,
                              element: (field as any).element,
                            })
                          }
                        />
                        <FieldError />
                      </div>
                      <div className="flex min-w-32 flex-col gap-3 pt-1">
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

                          <TokenSelector
                            onSelect={(token) => {
                              const target = activeField || {
                                onChange: field.onChange,
                                element: (field as any).element,
                              }
                              insertToken(token, target.onChange, target.element)
                            }}
                          />
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
                            {fields.map((field, index) => (
                              <tr
                                key={field.id}
                                className="bg-transparent transition-colors hover:bg-muted/30"
                              >
                                <td className="px-2 py-2">
                                  <Input
                                    {...form.register(
                                      `landingPages.${index}.name`
                                    )}
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
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-2 py-2">
                                  <Controller
                                    name={`landingPages.${index}.url`}
                                    control={form.control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        className="border-none bg-muted/20 text-xs shadow-none"
                                        placeholder="URL"
                                        ref={(el) => {
                                          field.ref(el)
                                          ;(field as any).element = el
                                        }}
                                        onFocus={() =>
                                          setActiveField({
                                            onChange: field.onChange,
                                            element: (field as any).element,
                                          })
                                        }
                                      />
                                    )}
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <Controller
                                    name={`landingPages.${index}.status`}
                                    control={form.control}
                                    render={({ field }) => (
                                      <Select
                                        value={
                                          field.value === "active"
                                            ? "Allow"
                                            : "Deny"
                                        }
                                        onValueChange={(val) =>
                                          field.onChange(
                                            val === "Allow"
                                              ? "active"
                                              : "inactive"
                                          )
                                        }
                                      >
                                        <SelectTrigger className="border-none text-[11px] shadow-none">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Allow">
                                            Allow
                                          </SelectItem>
                                          <SelectItem value="Deny">
                                            Deny
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <Input
                                    {...form.register(
                                      `landingPages.${index}.weight`
                                    )}
                                    className="border-none text-center text-xs shadow-none"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addLandingPageRow}
                      >
                        Add Row
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  name="visibility"
                  control={form.control}
                  render={({ field }) => (
                    <Field
                      orientation="vertical"
                      className="flex flex-row items-start justify-start gap-2"
                    >
                      <FieldLabel className="w-fit! min-w-40 shrink-0 text-sm font-medium">
                        Visibility
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
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="exclusive">Exclusive</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-6">
                <Field
                  orientation="vertical"
                  className="flex flex-row items-start justify-start gap-2"
                >
                  <FieldLabel className="w-fit! min-w-40 shrink-0 text-sm font-medium">
                    Pricing (Revenue)
                  </FieldLabel>
                  <FieldContent className="flex flex-1 gap-2">
                    <Controller
                      name="revenueType"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CPA">CPA</SelectItem>
                            <SelectItem value="CPC">CPC</SelectItem>
                            <SelectItem value="CPS">CPS</SelectItem>
                            <SelectItem value="CPL">CPL</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Controller
                      name="defaultRevenue"
                      control={form.control}
                      render={({ field }) => (
                        <Input {...field} className="w-24" />
                      )}
                    />
                    <Controller
                      name="currency"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldContent>
                </Field>
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
        <Button type="submit" className="gap-2" disabled={isPending}>
          {isPending ? (
            "Saving..."
          ) : (
            <>
              {submitLabel} <IconDeviceFloppy className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
