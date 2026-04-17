import { api } from "@/lib/api"
import { parseApiError } from "@/lib/error"
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "@adscrush/shared/validators/department.validator"
import { Treaty } from "@elysiajs/eden"
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import type { z } from "zod"
import { GetDepartmentsSchema } from "./validations"

export type Department = Treaty.Data<typeof api.departments.get>["data"][number]

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: (
    params: Omit<GetDepartmentsSchema, "filterFlag"> & { filterFlag?: string }
  ) => [...departmentKeys.lists(), { params }] as const,
}

export function getDepartmentsQueryOptions(params: GetDepartmentsSchema) {
  return queryOptions({
    queryKey: departmentKeys.list(params),
    queryFn: async () => {
      const { data, error } = await api.departments.get({
        query: {
          filterFlag: params.filterFlag,
          name: params.name ?? "",
          page: params.page,
          perPage: params.perPage,
          sort: JSON.stringify(
            params.sort
          ) as unknown as GetDepartmentsSchema["sort"],
          filters: JSON.stringify(
            params.filters
          ) as unknown as GetDepartmentsSchema["filters"],
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

export function useDepartments(params: GetDepartmentsSchema) {
  return useQuery(getDepartmentsQueryOptions(params))
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.departments({ id }).delete.post({})
      if (!response?.data?.success) {
        throw new Error("Failed to delete department")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: z.infer<typeof createDepartmentSchema>) => {
      const response = await api.departments.post(data as never)
      if (!response.data?.success) {
        throw new Error(
          (response.data as any).error || "Failed to create department"
        )
      }
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Partial<z.infer<typeof updateDepartmentSchema>>) => {
      const response = await api.departments({ id }).post(payload)
      if (!response?.data?.success) {
        throw new Error(
          (response.data as any).error || "Failed to update department"
        )
      }
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}

export function useBulkUpdateDepartmentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { ids: string[]; status: "active" | "inactive" }) => {
      const response = await api.departments["bulk-status"].post(payload as never)
      if (!response?.data?.success) {
        throw new Error("Failed to update departments status")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}

export function useBulkDeleteDepartments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.departments["bulk-delete"].post({ ids } as never)
      if (!response?.data?.success) {
        throw new Error("Failed to delete departments")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}
