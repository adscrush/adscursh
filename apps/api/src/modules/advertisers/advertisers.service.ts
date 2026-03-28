import { eq, like, sql, and, type SQL, inArray } from "@adscrush/db/drizzle"
import type { Database } from "@adscrush/db"
import { advertisers } from "@adscrush/db/schema"
import type { CreateAdvertiserInput, UpdateAdvertiserInput } from "@adscrush/shared/validators"

interface ListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  accountManagerId?: string
  scopedIds?: string[]
}

export async function listAdvertisers(db: Database, params: ListParams) {
  const page = params.page ?? 1
  const limit = params.limit ?? 20
  const offset = (page - 1) * limit

  const conditions: SQL[] = []
  if (params.search) {
    conditions.push(like(advertisers.name, `%${params.search}%`))
  }
  if (params.status) {
    conditions.push(eq(advertisers.status, params.status))
  }
  if (params.accountManagerId) {
    conditions.push(eq(advertisers.accountManagerId, params.accountManagerId))
  }
  if (params.scopedIds) {
    conditions.push(inArray(advertisers.id, params.scopedIds))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(advertisers)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(advertisers.createdAt),
    db
      .select({ count: sql<number>`count(*)` })
      .from(advertisers)
      .where(where),
  ])

  const total = Number(countResult[0]?.count ?? 0)

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getAdvertiser(db: Database, id: string) {
  const result = await db
    .select()
    .from(advertisers)
    .where(eq(advertisers.id, id))
    .limit(1)

  return result[0] ?? null
}

export async function createAdvertiser(
  db: Database,
  data: CreateAdvertiserInput
) {
  const [advertiser] = await db
    .insert(advertisers)
    .values({
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      website: data.website || null,
      country: data.country,
      accountManagerId: data.accountManagerId,
      status: data.status,
    })
    .returning()

  return advertiser
}

export async function updateAdvertiser(
  db: Database,
  id: string,
  data: UpdateAdvertiserInput
) {
  const values: Record<string, unknown> = { updatedAt: new Date() }
  if (data.name !== undefined) values["name"] = data.name
  if (data.companyName !== undefined) values["companyName"] = data.companyName
  if (data.email !== undefined) values["email"] = data.email
  if (data.website !== undefined) values["website"] = data.website || null
  if (data.country !== undefined) values["country"] = data.country
  if (data.accountManagerId !== undefined)
    values["accountManagerId"] = data.accountManagerId
  if (data.status !== undefined) values["status"] = data.status

  const [advertiser] = await db
    .update(advertisers)
    .set(values)
    .where(eq(advertisers.id, id))
    .returning()

  return advertiser
}
