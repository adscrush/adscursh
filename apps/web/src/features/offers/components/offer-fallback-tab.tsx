"use client"

import {
  updateOfferSchema,
  type UpdateOfferInput,
} from "@adscrush/shared/validators/offer.schema"
import { Button } from "@adscrush/ui/components/button"
import { Card, CardContent } from "@adscrush/ui/components/card"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { IconDeviceFloppy } from "@tabler/icons-react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { OfferDetail } from "../queries"

interface OfferFallbackTabProps {
  offer: OfferDetail
  onSubmit: SubmitHandler<UpdateOfferInput>
  isPending: boolean
}

export function OfferFallbackTab({
  offer,
  onSubmit,
  isPending,
}: OfferFallbackTabProps) {
  const form = useForm({
    resolver: zodResolver(updateOfferSchema),
    defaultValues: {
      postbackType: (offer.postbackType as "pixel" | "postback") ?? "pixel",
      whitelistPostbackReferralDomain:
        offer.whitelistPostbackReferralDomain ?? "",
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-8 pt-6">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Postback</h3>
          </div>

          <div className="space-y-6">
            <Controller
              name="postbackType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="vertical"
                  data-invalid={fieldState.invalid}
                  className="flex flex-row items-start justify-start gap-2"
                >
                  <FieldLabel className="w-fit! min-w-40 shrink-0 text-sm font-medium">
                    Postback Type
                  </FieldLabel>
                  <FieldContent className="max-w-md flex-1 grow">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pixel">Pixel</SelectItem>
                        <SelectItem value="postback">Postback</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="whitelistPostbackReferralDomain"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="vertical"
                  data-invalid={fieldState.invalid}
                  className="flex flex-row items-start justify-start gap-2"
                >
                  <FieldLabel className="w-fit! max-w-40 min-w-40 shrink-0 text-sm font-medium">
                    Whitelist Postback Referral Domain
                  </FieldLabel>
                  <FieldContent className="max-w-md flex-1 grow">
                    <textarea
                      {...field}
                      value={field.value || ""}
                      rows={3}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <FieldError />
                  </FieldContent>
                </Field>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" className="gap-2" disabled={isPending}>
          {isPending ? (
            "Saving..."
          ) : (
            <>
              Save Changes <IconDeviceFloppy className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
