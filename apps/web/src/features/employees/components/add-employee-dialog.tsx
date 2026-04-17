"use client"

import type { CreateEmployeeInput } from "@adscrush/shared/validators/employee.validator"
import { createEmployeeSchema } from "@adscrush/shared/validators/employee.validator"
import { Button } from "@adscrush/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adscrush/ui/components/dialog"
import { Field, FieldError, FieldLabel } from "@adscrush/ui/components/field"
import { Input } from "@adscrush/ui/components/input"
import { toast } from "@adscrush/ui/sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import React, { useState } from "react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { useCreateEmployee } from "../queries"
import { useDepartments } from "@/features/departments/queries"
import type { GetDepartmentsSchema } from "@/features/departments/validations"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"

interface AddEmployeeDialogProps {
  children?: React.ReactElement
  onOpenChange?: (open: boolean) => void
  onCreated?: () => void
}

export function AddEmployeeDialog({
  children,
  onOpenChange,
  onCreated,
}: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateEmployee()
  const departmentParams: GetDepartmentsSchema = {
    filterFlag: "commandFilters",
    page: 1,
    perPage: 100,
    name: "",
    status: [],
    sort: [],
    filters: [],
    createdAt: [],
    joinOperator: "and",
  }
  const { data: departmentsResult } = useDepartments(departmentParams)
  const departments = departmentsResult?.data ?? []

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      departmentId: undefined,
      role: "employee",
    },
  })

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = form

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
    if (!newOpen) reset()
  }

  const onSubmit: SubmitHandler<CreateEmployeeInput> = async (data) => {
    await createMutation.mutateAsync(data, {
      onSuccess: () => {
        toast.success("Employee created successfully!")
        handleOpenChange(false)
        onCreated?.()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Create a new employee account. An email with login instructions will
            be sent to the employee.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input placeholder="John Doe" {...field} />
              )}
            />
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input type="email" placeholder="john@example.com" {...field} />
              )}
            />
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  {...field}
                />
              )}
            />
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Department</FieldLabel>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              Create Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
