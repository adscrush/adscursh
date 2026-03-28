import { eq, like, sql, and, type SQL } from "@adscrush/db/drizzle"
import type { Database } from "@adscrush/db"
import { employees, users } from "@adscrush/db/schema"
import {
  employeeAffiliateAccess,
  employeeAdvertiserAccess,
} from "@adscrush/db/schema"

interface ListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export async function listEmployees(db: Database, params: ListParams) {
  const page = params.page ?? 1
  const limit = params.limit ?? 20
  const offset = (page - 1) * limit

  const conditions: SQL[] = []
  if (params.search) {
    conditions.push(like(users.name, `%${params.search}%`))
  }
  if (params.status) {
    conditions.push(eq(employees.status, params.status))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [items, countResult] = await Promise.all([
    db
      .select({
        id: employees.id,
        userId: employees.userId,
        department: employees.department,
        status: employees.status,
        createdAt: employees.createdAt,
        name: users.name,
        email: users.email,
        role: users.role,
        image: users.image,
      })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(employees.createdAt),
    db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(where),
  ])

  const total = Number(countResult[0]?.count ?? 0)

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getEmployee(db: Database, id: string) {
  const result = await db
    .select({
      id: employees.id,
      userId: employees.userId,
      department: employees.department,
      status: employees.status,
      createdAt: employees.createdAt,
      updatedAt: employees.updatedAt,
      name: users.name,
      email: users.email,
      role: users.role,
      image: users.image,
    })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id))
    .where(eq(employees.id, id))
    .limit(1)

  if (!result[0]) return null

  const [affAccess, advAccess] = await Promise.all([
    db
      .select({ affiliateId: employeeAffiliateAccess.affiliateId })
      .from(employeeAffiliateAccess)
      .where(eq(employeeAffiliateAccess.employeeId, id)),
    db
      .select({ advertiserId: employeeAdvertiserAccess.advertiserId })
      .from(employeeAdvertiserAccess)
      .where(eq(employeeAdvertiserAccess.employeeId, id)),
  ])

  return {
    ...result[0],
    assignedAffiliateIds: affAccess.map((a) => a.affiliateId),
    assignedAdvertiserIds: advAccess.map((a) => a.advertiserId),
  }
}

export async function createEmployee(
  db: Database,
  data: { userId: string; department?: string }
) {
  const [employee] = await db
    .insert(employees)
    .values({
      userId: data.userId,
      department: data.department,
    })
    .returning()

  return employee
}

export async function updateEmployee(
  db: Database,
  id: string,
  data: { department?: string; status?: string }
) {
  const [employee] = await db
    .update(employees)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(employees.id, id))
    .returning()

  return employee
}

export async function updateEmployeeAccess(
  db: Database,
  employeeId: string,
  data: { affiliateIds?: string[]; advertiserIds?: string[] }
) {
  if (data.affiliateIds !== undefined) {
    await db
      .delete(employeeAffiliateAccess)
      .where(eq(employeeAffiliateAccess.employeeId, employeeId))

    if (data.affiliateIds.length > 0) {
      await db.insert(employeeAffiliateAccess).values(
        data.affiliateIds.map((affiliateId) => ({
          employeeId,
          affiliateId,
        }))
      )
    }
  }

  if (data.advertiserIds !== undefined) {
    await db
      .delete(employeeAdvertiserAccess)
      .where(eq(employeeAdvertiserAccess.employeeId, employeeId))

    if (data.advertiserIds.length > 0) {
      await db.insert(employeeAdvertiserAccess).values(
        data.advertiserIds.map((advertiserId) => ({
          employeeId,
          advertiserId,
        }))
      )
    }
  }
}

export async function getEmployeeByUserId(db: Database, userId: string) {
  const result = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId))
    .limit(1)

  return result[0] ?? null
}
