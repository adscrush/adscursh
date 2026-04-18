import { api } from "@/lib/api"
import { parseApiError } from "@/lib/error"
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "@adscrush/shared/validators/employee.validator"
import { Treaty } from "@elysiajs/eden"
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import type { z } from "zod"
import { GetEmployeesSchema } from "./validations"

export type Employee = Treaty.Data<typeof api.employees.get>["data"][number]
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (
    params: Omit<GetEmployeesSchema, "filterFlag"> & { filterFlag?: string }
  ) => [...employeeKeys.lists(), { params }] as const,
}

export function getEmployeesQueryOptions(params: GetEmployeesSchema) {
  return queryOptions({
    queryKey: employeeKeys.list(params),
    queryFn: async () => {
      const { data, error } = await api.employees.get({
        query: {
          filterFlag: params.filterFlag,
          name: params.name ?? "",
          page: params.page,
          perPage: params.perPage,
          sort: JSON.stringify(
            params.sort
          ) as unknown as GetEmployeesSchema["sort"],
          filters: JSON.stringify(
            params.filters
          ) as unknown as GetEmployeesSchema["filters"],
          joinOperator: params.joinOperator,
          createdAt: params.createdAt,
          status: params.status,
        },
      })

      if (error) {
        throw new Error(parseApiError(error))
      }

      if (!data || !data.success) {
        throw new Error("Invalid response")
      }

      return {
        data: data.data,
        pageCount: data.meta.totalPages,
        meta: data.meta,
      }
    },
    placeholderData: keepPreviousData,
  })
}

export function useEmployees(params: GetEmployeesSchema) {
  return useQuery(getEmployeesQueryOptions(params))
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.employees({ id }).delete.post({})
      if (!response?.data?.success) {
        throw new Error("Failed to delete employee")
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
    mutationFn: async (data: z.infer<typeof createEmployeeSchema>) => {
      const response = await api.employees.post(data as never)
      if (!response.data?.success) {
        throw new Error(
          (response.data as any).error || "Failed to create employee"
        )
      }
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Partial<z.infer<typeof updateEmployeeSchema>>) => {
      const response = await api.employees({ id }).post(payload)
      if (!response?.data?.success) {
        throw new Error(
          (response.data as any).error || "Failed to update employee"
        )
      }
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useBulkUpdateEmployeeStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      ids: string[]
      status: "active" | "inactive" | "suspended"
    }) => {
      const response = await api.employees["bulk-status"].post(payload as never)
      if (!response?.data?.success) {
        throw new Error("Failed to update employees status")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useBulkDeleteEmployees() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.employees["bulk-delete"].post({ ids })
      if (!response?.data?.success) {
        throw new Error("Failed to delete employees")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useEmployeeSearch(q: string) {
  return useQuery({
    queryKey: [...employeeKeys.all, "search", q],
    queryFn: async () => {
      const { data, error } = await api.employees.get({
        query: {
          filterFlag: "commandFilters",
          name: q,
          page: 1,
          perPage: 20,
          sort: [],
          filters: [],
          status: [],
          createdAt: [],
          joinOperator: "and",
        },
      })

      if (error) {
        throw new Error(parseApiError(error))
      }

      if (!data || !data.success) {
        throw new Error("Failed to search employees")
      }

      return data.data
    },
    enabled: q.length >= 0,
  })
}
