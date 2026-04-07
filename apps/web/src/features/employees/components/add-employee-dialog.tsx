"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateEmployee } from "@/features/employees/queries"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adscrush/ui/components/dialog"
import { Button } from "@adscrush/ui/components/button"
import { Input } from "@adscrush/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adscrush/ui/components/select"
import { Field, FieldLabel, FieldGroup } from "@adscrush/ui/components/field"
import { createEmployeeSchema, type CreateEmployeeInput } from "@adscrush/shared/validators/employee.validator"
import { toast } from "@adscrush/ui/sonner"
import { IconLoader2, IconPlus } from "@tabler/icons-react"

interface AddEmployeeDialogProps {
  onCreated?: () => void
}

export function AddEmployeeDialog({ onCreated }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false)

  const createEmployee = useCreateEmployee()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      department: "",
      role: "employee",
    },
  })

  const currentRole = watch("role")

  const onSubmit = async (data: CreateEmployeeInput) => {
    try {
      await createEmployee.mutateAsync(data)
      toast.success("Employee created successfully!")
      setOpen(false)
      reset()
      if (onCreated) onCreated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus className="mr-2 size-3.5" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Employee</DialogTitle>
          <DialogDescription>
            Add a new team member to your dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Name *</FieldLabel>
              <Input
                required
                {...register("name")}
                placeholder="Full Name"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </Field>

            <Field>
              <FieldLabel>Email *</FieldLabel>
              <Input
                required
                type="email"
                {...register("email")}
                placeholder="employee@adscrush.com"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </Field>

            <Field>
              <FieldLabel>Temporary Password *</FieldLabel>
              <Input
                required
                type="password"
                {...register("password")}
                placeholder="Minimum 8 characters"
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Department / Group</FieldLabel>
                <Input
                  {...register("department")}
                  placeholder="e.g. Administrator, Sales"
                />
                {errors.department && <p className="text-sm text-destructive mt-1">{errors.department.message}</p>}
              </Field>

              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select
                  value={currentRole}
                  onValueChange={(val) => setValue("role", val as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message}</p>}
              </Field>
            </div>
          </FieldGroup>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={createEmployee.isPending} className="flex-1">
              {createEmployee.isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : "Create Employee"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
