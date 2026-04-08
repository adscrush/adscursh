import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { createEmployeeSchema, type CreateEmployeeInput } from "@adscrush/shared/validators/employee.validator"
import { updateEmployeeSchema, type UpdateEmployeeInput } from "@adscrush/shared/validators/employee.validator"

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: { page: number; limit: number; search?: string; status?: string }) =>
    [...employeeKeys.lists(), { filters }] as const,
}

interface Employee {
  id: string
  userId: string
  name: string
  email: string
  role: "admin" | "employee"
  image: string | null
  department: string | null
  status: "active" | "inactive" | "suspended"
  createdAt: string
  assignedAffiliateIds?: string[]
  assignedAdvertiserIds?: string[]
}

interface EmployeeListResponse {
  success: boolean
  data: Employee[]
  total?: number
  page?: number
  totalPages?: number
  error?: string
}

export function useEmployees({
  page,
  search,
  status,
}: {
  page: number
  search: string
  status: string
}) {
  return useQuery({
    queryKey: employeeKeys.list({
      page,
      limit: 20,
      search: search || undefined,
      status: status !== "all" ? status : undefined,
    }),
    queryFn: async () => {
      const response = await api.employees.get({
        query: {
          page,
          limit: 20,
          search: search || undefined,
          status: status !== "all" ? status : undefined,
        },
      })
      if (!response.data?.success || !response.data.data) {
        throw new Error("Failed to fetch employees")
      }
      return response.data as EmployeeListResponse
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEmployeeInput }) => {
      const response = await api.employees.put(id, data as any)
      if (!response.data?.success) {
        throw new Error("Failed to update employee")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateEmployeeInput) => {
      const response = await api.employees.post(data as any)
      if (!response.data?.success) {
        throw new Error("Failed to create employee")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}
