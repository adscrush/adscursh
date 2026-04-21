"use client"

import { AFFILIATE_STATUS } from "@adscrush/shared/constants/status"
import { updateAffiliateSchema } from "@adscrush/shared/validators/affiliate.validator"
import { Button } from "@adscrush/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adscrush/ui/components/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@adscrush/ui/components/field"
import { Input } from "@adscrush/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"
import { toast } from "@adscrush/ui/sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import type { z } from "zod"
import type { Affiliate } from "../queries"
import { useUpdateAffiliate } from "../queries"

const editSchema = updateAffiliateSchema.partial()

type EditAffiliateInput = z.infer<typeof editSchema>

interface UpdateAffiliateDialogProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Dialog>,
  "children"
> {
  affiliate: Affiliate | null
}

export function UpdateAffiliateDialog({
  affiliate,
  open,
  onOpenChange,
}: UpdateAffiliateDialogProps) {
  const updateMutation = useUpdateAffiliate()

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: affiliate?.name || "",
      companyName: affiliate?.companyName || "",
      email: affiliate?.email || "",
      status: affiliate?.status || "active",
    },
  })

  React.useEffect(() => {
    if (open && affiliate) {
      reset({
        name: affiliate.name,
        companyName: affiliate.companyName || "",
        email: affiliate.email,
        status: affiliate.status,
      })
    }
  }, [open, affiliate?.id])

  const onSubmit = async (data: EditAffiliateInput) => {
    if (!affiliate) return

    await updateMutation.mutateAsync(
      { id: affiliate.id, ...data },
      {
        onSuccess: () => {
          toast.success("Affiliate updated")
          onOpenChange?.(false, {
            source: "programmatic",
            event: undefined,
          } as any)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  const isLoading = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={affiliate?.id}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Affiliate</DialogTitle>
          <DialogDescription>Update affiliate details.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field orientation="vertical" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Company</FieldLabel>
                  <FieldContent>
                    <Input {...field} id={field.name} />
                  </FieldContent>
                </Field>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field orientation="vertical" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      type="email"
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select
                    value={field.value || "active"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AFFILIATE_STATUS).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={isLoading} type="button">
                  Cancel
                </Button>
              }
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
