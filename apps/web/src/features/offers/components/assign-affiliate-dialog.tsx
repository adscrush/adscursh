"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adscrush/ui/components/dialog"
import { Button } from "@adscrush/ui/components/button"
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
import { AffiliateSelect } from "./affiliate-select"
import { useAssignOfferAffiliate } from "../queries"
import { toast } from "@adscrush/ui/sonner"
import { IconUserPlus } from "@tabler/icons-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { assignAffiliateSchema } from "@adscrush/shared/validators/offer.schema"
import type { z } from "zod"

interface AssignAffiliateDialogProps {
  offerId: string
  children?: React.ReactNode
}

type AssignFormValues = z.infer<typeof assignAffiliateSchema>

export function AssignAffiliateDialog({
  offerId,
  children,
}: AssignAffiliateDialogProps) {
  const [open, setOpen] = React.useState(false)
  const assignMutation = useAssignOfferAffiliate()

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignAffiliateSchema),
    defaultValues: {
      affiliateId: "",
      status: "approved",
    },
  })

  const onSubmit = async (values: AssignFormValues) => {
    try {
      await assignMutation.mutateAsync({
        id: offerId,
        data: values,
      })
      toast.success("Affiliate assigned successfully")
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || "Failed to assign affiliate")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="gap-2">
            <IconUserPlus className="size-4" /> Assign Affiliate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Assign Affiliate</DialogTitle>
            <DialogDescription>
              Assign an affiliate to this offer and set their initial status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Controller
              control={form.control}
              name="affiliateId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Affiliate</FieldLabel>
                  <FieldContent>
                    <AffiliateSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                    <FieldError />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Initial Status</FieldLabel>
                  <FieldContent>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={assignMutation.isPending}
              className="w-full"
            >
              {assignMutation.isPending ? "Assigning..." : "Assign Affiliate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
