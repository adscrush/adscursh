import { Employee, employees } from "@adscrush/db/schema"
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@adscrush/shared/lib/query-parser"
import { z } from "zod"

export const listQuerySchema = z.object({
  filterFlag: z
    .enum(["advancedFilters", "commandFilters"])
    .default("commandFilters"),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().default(10),

  sort: getSortingStateParser<Employee>().default([
    { id: "createdAt", desc: true },
  ]),
  filters: getFiltersStateParser().default([]),

  name: z.string().default(""),
  status: z.array(z.enum(employees.status.enumValues)).default([]),

  createdAt: z.array(z.coerce.number().int().positive()).default([]),
  joinOperator: z.enum(["and", "or"]).default("and"),
})

export type ListEmployeesQuerySchema = z.infer<typeof listQuerySchema>
