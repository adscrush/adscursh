import { eq, like, sql, and, type SQL, inArray } from "@adscrush/db/drizzle"
import type { Database } from "@adscrush/db"
import { affiliates } from "@adscrush/db/schema"
import type { CreateAffiliateInput, UpdateAffiliateInput } from "@adscrush/shared/validators"

interface ListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  accountManagerId?: string
  scopedIds?: string[]
}

export async function listAffiliates(db: Database, params: ListParams) {
  const page = params.page ?? 1
  const limit = params.limit ?? 20
  const offset = (page - 1) * limit

  const conditions: SQL[] = []
  if (params.search) {
    conditions.push(like(affiliates.name, `%${params.search}%`))
  }
  if (params.status) {
    conditions.push(eq(affiliates.status, params.status))
  }
  if (params.accountManagerId) {
    conditions.push(eq(affiliates.accountManagerId, params.accountManagerId))
  }
  if (params.scopedIds) {
    conditions.push(inArray(affiliates.id, params.scopedIds))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(affiliates)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(affiliates.createdAt),
    db
      .select({ count: sql<number>`count(*)` })
      .from(affiliates)
      .where(where),
  ])

  const total = Number(countResult[0]?.count ?? 0)

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getAffiliate(db: Database, id: string) {
  const result = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, id))
    .limit(1)

  return result[0] ?? null
}

export async function createAffiliate(
  db: Database,
  data: CreateAffiliateInput
) {
  const [affiliate] = await db
    .insert(affiliates)
    .values({
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      accountManagerId: data.accountManagerId,
      status: data.status,
    })
    .returning()

  return affiliate
}

export async function updateAffiliate(
  db: Database,
  id: string,
  data: UpdateAffiliateInput
) {
  const values: Record<string, unknown> = { updatedAt: new Date() }
  if (data.name !== undefined) values["name"] = data.name
  if (data.companyName !== undefined) values["companyName"] = data.companyName
  if (data.email !== undefined) values["email"] = data.email
  if (data.accountManagerId !== undefined)
    values["accountManagerId"] = data.accountManagerId
  if (data.status !== undefined) values["status"] = data.status

  const [affiliate] = await db
    .update(affiliates)
    .set(values)
    .where(eq(affiliates.id, id))
    .returning()

  return affiliate
}
