"use cache"

import "server-only"

import { db } from "@/lib/db"
import { employees, users } from "@adscrush/db"
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  sql,
} from "@adscrush/db/drizzle"
import { cacheTag } from "next/cache"

import type { GetEmployeesSchema } from "./validations"

export async function getEmployees(input: GetEmployeesSchema) {
  cacheTag("employees")

  try {
    const offset = (input.page - 1) * input.perPage

    const advancedTable =
      input.filterFlag === "advancedFilters" ||
      input.filterFlag === "commandFilters"

    const where = advancedTable
      ? undefined
      : and(
          input.name ? ilike(users.name, `%${input.name}%`) : undefined,
          input.email ? ilike(users.email, `%${input.email}%`) : undefined,
          input.status.length > 0
            ? inArray(employees.status, input.status as [string, ...string[]])
            : undefined,
          input.createdAt.length > 0
            ? and(
                input.createdAt[0]
                  ? gte(
                      employees.createdAt,
                      (() => {
                        const date = new Date(input.createdAt[0])
                        date.setHours(0, 0, 0, 0)
                        return date
                      })()
                    )
                  : undefined,
                input.createdAt[1]
                  ? lte(
                      employees.createdAt,
                      (() => {
                        const date = new Date(input.createdAt[1])
                        date.setHours(23, 59, 59, 999)
                        return date
                      })()
                    )
                  : undefined
              )
            : undefined
        )

    const orderBy =
      input.sort.length > 0
        ? input.sort.map((item) =>
            item.desc
              ? desc(employees[item.id as keyof typeof employees & string])
              : sql`${employees.createdAt} asc`
          )
        : [desc(employees.createdAt)]

    const dataResult = await db
      .select({
        id: employees.id,
        userId: employees.userId,
        name: users.name,
        email: users.email,
        role: users.role,
        image: users.image,
        department: employees.department,
        status: employees.status,
        createdAt: employees.createdAt,
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(where)
      .limit(input.perPage)
      .offset(offset)
      .orderBy(...orderBy)

    const totalResult = await db
      .select({ count: count() })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))

    const total = totalResult[0]?.count ?? 0
    const pageCount = Math.ceil(total / input.perPage)

    return { data: dataResult, pageCount }
  } catch {
    return { data: [], pageCount: 0 }
  }
}

export async function getEmployeeStatusCounts() {
  cacheTag("employee-status-counts")

  try {
    const result = await db
      .select({
        status: employees.status,
        count: count(),
      })
      .from(employees)
      .groupBy(employees.status)

    const counts: Record<string, number> = {
      active: 0,
      inactive: 0,
      suspended: 0,
    }

    for (const { status, count } of result) {
      counts[status ?? "active"] = count
    }

    return counts as { active: number; inactive: number; suspended: number }
  } catch {
    return {
      active: 0,
      inactive: 0,
      suspended: 0,
    }
  }
}
