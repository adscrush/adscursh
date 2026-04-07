"use client"

import { ADVERTISER_STATUS } from "@adscrush/shared/constants/status"
import type { CreateAdvertiserInput } from "@adscrush/shared/validators/advertiser.schema"
import { createAdvertiserSchema } from "@adscrush/shared/validators/advertiser.schema"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@adscrush/ui/components/avatar"
import { Button } from "@adscrush/ui/components/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@adscrush/ui/components/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adscrush/ui/components/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
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
import { IconSelector, IconKey, IconLoader2 } from "@tabler/icons-react"
import React, { useState } from "react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { useCreateAdvertiser, useEmployees } from "../queries"

function generatePassword(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  return Array.from({ length: 12 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("")
}

interface AddAdvertiserDialogProps {
  children?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  onCreated?: () => void
}

export function AddAdvertiserDialog({
  children,
  onOpenChange,
  onCreated,
}: AddAdvertiserDialogProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const createMutation = useCreateAdvertiser()
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees()

  const form = useForm<CreateAdvertiserInput>({
    resolver: zodResolver(createAdvertiserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
      status: "active",
      accountManagerId: "",
    },
  })

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const currentStatus = watch("status")
  const currentAccountManagerId = watch("accountManagerId")

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
    if (!newOpen) reset()
  }

  const onSubmit: SubmitHandler<CreateAdvertiserInput> = async (data) => {
    await createMutation.mutateAsync(
      {
        ...data,
        accountManagerId: data.accountManagerId,
        website: data.website || undefined,
        companyName: data.companyName || undefined,
        country: data.country || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Advertiser created successfully!")
          handleOpenChange(false)
          onCreated?.()
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  const handleGeneratePassword = () => {
    const password = generatePassword()
    setValue("password", password, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} size="lg">
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto" ref={ref}>
        <DialogHeader>
          <DialogTitle>Create Advertiser</DialogTitle>
          <DialogDescription>
            Add a new advertiser to your network
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          <FieldGroup className="flex flex-row items-start gap-4">
            {/* ── Name ── */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="vertical" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="">
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent className="w-full flex-1">
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Advertiser name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
            {/* ── Company ── */}
            <Controller
              name="companyName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="vertical" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="">
                    Company (Brand)
                  </FieldLabel>
                  <FieldContent className="w-full flex-1">
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Company"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          {/* ── Email ── */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="vertical" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="">
                  Email <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent className="w-full flex-1">
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="test@example.com"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          {/* ── Password ── */}
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="vertical" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="">
                  Password <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <div className="flex w-full flex-1 flex-row gap-2">
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Password"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleGeneratePassword}
                      className="shrink-0"
                    >
                      <IconKey className="mr-1 size-3.5" />
                      Generate
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          {/* ── Account Manager (Combobox) ── */}
          <FieldGroup className="flex flex-row items-start gap-4">
            <Controller
              name="accountManagerId"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedEmp = employees.find(
                  (e) => e.id === currentAccountManagerId
                )

                return (
                  <Field
                    orientation="vertical"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Account Manager
                    </FieldLabel>
                    <FieldContent>
                      <Combobox
                        autoHighlight
                        items={employees}
                        value={selectedEmp ?? null}
                        itemToStringValue={(emp) => emp.name}
                        onValueChange={(emp) =>
                          setValue("accountManagerId", emp?.id ?? "")
                        }
                        disabled={loadingEmployees}
                      >
                        <ComboboxTrigger
                          render={
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal"
                              disabled={loadingEmployees}
                            >
                              {selectedEmp ? (
                                <div className="flex min-w-0 items-center gap-2">
                                  <Avatar className="size-5 shrink-0">
                                    {selectedEmp.image ? (
                                      <AvatarImage
                                        src={selectedEmp.image}
                                        alt={selectedEmp.name}
                                      />
                                    ) : null}
                                    <AvatarFallback className="text-[0.5rem]">
                                      {selectedEmp.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">
                                    {selectedEmp.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="truncate text-muted-foreground">
                                  Select account manager...
                                </span>
                              )}
                              <IconSelector className="ml-2 size-3.5 shrink-0 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <ComboboxContent className="min-w-0" container={ref}>
                          <div className="w-full p-1.5">
                            <ComboboxInput
                              className="min-w-0 rounded-md"
                              placeholder="Search account manager..."
                              showTrigger={false}
                              showClear={false}
                            />
                          </div>
                          <ComboboxEmpty>No results found.</ComboboxEmpty>
                          <ComboboxList>
                            {(emp: {
                              id: string
                              name: string
                              avatarUrl?: string
                            }) => (
                              <ComboboxItem key={emp.id} value={emp}>
                                <div className="flex min-w-0 items-center gap-2">
                                  <Avatar className="size-5 shrink-0">
                                    {emp.avatarUrl ? (
                                      <AvatarImage
                                        src={emp.avatarUrl}
                                        alt={emp.name}
                                      />
                                    ) : null}
                                    <AvatarFallback className="text-[0.5rem]">
                                      {emp.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">{emp.name}</span>
                                </div>
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )
              }}
            />

            {/* ── Status ── */}
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <FieldContent>
                    <Select
                      value={currentStatus}
                      onValueChange={(value) =>
                        setValue(
                          "status",
                          value as CreateAdvertiserInput["status"]
                        )
                      }
                    >
                      <SelectTrigger className="w-full" {...field}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ADVERTISER_STATUS).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
          {/* ── Submit ── */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Advertiser"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
