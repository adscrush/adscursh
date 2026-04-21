import Elysia from "elysia"
import {
  eq,
  ilike,
  sql,
  and,
  desc,
  or,
  asc,
  gte,
  lte,
  inArray,
} from "@adscrush/db/drizzle"
import {
  offers,
  categories,
  advertisers,
  landingPages,
  offerAffiliates,
  affiliates,
} from "@adscrush/db/schema"
import { db } from "../../lib/db"
import { AppError } from "../../utils/errors"
import { requireAuth } from "../../middleware/auth.middleware"
import { listQuerySchema, trackingUrlQuerySchema } from "./config"
import {
  createOfferSchema,
  updateOfferSchema,
  createLandingPageSchema,
  updateLandingPageSchema,
  assignAffiliateSchema,
  updateOfferAffiliateSchema,
  bulkOfferAffiliateSchema,
} from "@adscrush/shared/validators/offer.schema"
import { filterColumns, getColumn } from "@adscrush/db/lib/filter-columns"

export const offerRoutes = new Elysia({ prefix: "/offers" })
  .use(requireAuth)

  // ── GET / ──────────────────────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      try {
        const parsed = listQuerySchema.parse(query)
        const {
          page,
          perPage,
          search,
          status,
          advertiserId,
          joinOperator,
          sort,
          filters,
          createdAt,
        } = parsed

        const offset = (page - 1) * perPage

        const tableWithJoinedColumns = {
          ...offers,
          advertiser: advertisers.name,
          category: categories.name,
          payout: offers.defaultPayout,
          revenue: offers.defaultRevenue,
        }

        const advancedWhere = filterColumns({
          table: tableWithJoinedColumns,
          filters,
          joinOperator,
          database: "postgres",
        })

        const simpleWhere = and(
          search ? ilike(offers.name, `%${search}%`) : undefined,
          status.length > 0
            ? or(...status.map((s) => eq(offers.status, s)))
            : undefined,
          advertiserId ? eq(offers.advertiserId, advertiserId) : undefined,
          createdAt.length > 0
            ? and(
                createdAt[0]
                  ? gte(
                      offers.createdAt,
                      (() => {
                        const d = new Date(createdAt[0])
                        d.setHours(0, 0, 0, 0)
                        return d
                      })()
                    )
                  : undefined,
                createdAt[1]
                  ? lte(
                      offers.createdAt,
                      (() => {
                        const d = new Date(createdAt[1])
                        d.setHours(23, 59, 59, 999)
                        return d
                      })()
                    )
                  : undefined
              )
            : undefined
        )

        const where = and(advancedWhere, simpleWhere)

        const orderBy =
          sort.length > 0
            ? sort.map((item) => {
                const column = getColumn(tableWithJoinedColumns, item.id)
                if (!column) return desc(offers.createdAt)

                const isString = [
                  "name",
                  "advertiser",
                  "category",
                  "id",
                  "status",
                ].includes(item.id)
                const sortColumn = isString ? sql`lower(${column})` : column

                return item.desc ? desc(sortColumn) : asc(sortColumn)
              })
            : [desc(offers.createdAt)]

        const [items, countResult] = await Promise.all([
          db
            .select({
              id: offers.id,
              name: offers.name,
              logo: offers.logo,
              status: offers.status,
              advertiserId: offers.advertiserId,
              categoryId: offers.categoryId,
              revenueType: offers.revenueType,
              defaultRevenue: offers.defaultRevenue,
              payoutType: offers.payoutType,
              defaultPayout: offers.defaultPayout,
              currency: offers.currency,
              createdAt: offers.createdAt,
              updatedAt: offers.updatedAt,
              advertiser: {
                id: advertisers.id,
                name: advertisers.name,
              },
              category: {
                id: categories.id,
                name: categories.name,
              },
            })
            .from(offers)
            .leftJoin(advertisers, eq(offers.advertiserId, advertisers.id))
            .leftJoin(categories, eq(offers.categoryId, categories.id))
            .where(where)
            .limit(perPage)
            .offset(offset)
            .orderBy(...orderBy),
          db
            .select({ count: sql<number>`count(*)` })
            .from(offers)
            .leftJoin(advertisers, eq(offers.advertiserId, advertisers.id))
            .leftJoin(categories, eq(offers.categoryId, categories.id))
            .where(where),
        ])

        const total = Number(countResult[0]?.count ?? 0)
        return {
          success: true,
          data: items,
          meta: {
            page,
            perPage,
            total,
            totalPages: Math.ceil(total / perPage),
          },
        }
      } catch (e: any) {
        console.error("Error in GET /offers:", e)
        throw e
      }
    },
    { query: listQuerySchema }
  )

  // ── GET /:id ───────────────────────────────────────────────────
  .get("/:id", async ({ params }) => {
    const [result] = await db
      .select({
        id: offers.id,
        name: offers.name,
        advertiserId: offers.advertiserId,
        categoryId: offers.categoryId,
        logo: offers.logo,
        description: offers.description,
        privateNote: offers.privateNote,
        offerUrl: offers.offerUrl,
        status: offers.status,
        visibility: offers.visibility,
        revenueType: offers.revenueType,
        defaultRevenue: offers.defaultRevenue,
        currency: offers.currency,
        payoutType: offers.payoutType,
        defaultPayout: offers.defaultPayout,
        targetGeo: offers.targetGeo,
        fallbackUrl: offers.fallbackUrl,
        allowMultiConversion: offers.allowMultiConversion,
        postbackType: offers.postbackType,
        whitelistPostbackReferralDomain: offers.whitelistPostbackReferralDomain,
        startDate: offers.startDate,
        endDate: offers.endDate,
        createdAt: offers.createdAt,
        updatedAt: offers.updatedAt,
        advertiser: {
          id: advertisers.id,
          name: advertisers.name,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(offers)
      .leftJoin(advertisers, eq(offers.advertiserId, advertisers.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .where(eq(offers.id, params.id))
      .limit(1)
    if (!result) throw new AppError(404, "Offer not found")

    const [lps, oaCount] = await Promise.all([
      db
        .select()
        .from(landingPages)
        .where(eq(landingPages.offerId, params.id))
        .orderBy(desc(landingPages.createdAt)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(offerAffiliates)
        .where(eq(offerAffiliates.offerId, params.id)),
    ])

    return {
      success: true,
      data: {
        ...result,
        landingPages: lps,
        affiliateCount: Number(oaCount[0]?.count ?? 0),
      },
    }
  })

  // ── POST / ─────────────────────────────────────────────────────
  .post(
    "/",
    async ({ body }) => {
      const { landingPages: lps, ...offerData } = body

      return await db.transaction(async (tx) => {
        const [offer] = await tx.insert(offers).values(offerData).returning()

        if (lps && lps.length > 0) {
          const validLps = lps.filter(lp => lp.name && lp.url)
          if (validLps.length > 0 && offer) {
            await tx.insert(landingPages).values(
              validLps.map(lp => ({
                name: lp.name!,
                url: lp.url!,
                weight: lp.weight,
                status: lp.status,
                offerId: offer.id,
              }))
            )
          }
        }

        return { success: true, data: offer, status: 201 }
      })
    },
    { body: createOfferSchema }
  )

  // ── POST /:id ───────────────────────────────────────────────────
  .post(
    "/:id",
    async ({ params, body }) => {
      const { landingPages: lps, ...offerData } = body

      return await db.transaction(async (tx) => {
        const [offer] = await tx
          .update(offers)
          .set({ ...offerData, updatedAt: new Date() })
          .where(eq(offers.id, params.id))
          .returning()

        if (!offer) throw new AppError(404, "Offer not found")

        if (lps) {
          // Sync landing pages
          const validLps = lps.filter((lp) => lp.name && lp.url)

          if (validLps.length > 0) {
            // Get existing LP IDs
            const existingLps = await tx
              .select({ id: landingPages.id })
              .from(landingPages)
              .where(eq(landingPages.offerId, params.id))

            const existingIds = existingLps.map((lp) => lp.id)
            const incomingIds = validLps
              .map((lp) => lp.id)
              .filter(Boolean) as string[]

            // Delete removed LPs
            const toDelete = existingIds.filter(
              (id) => !incomingIds.includes(id)
            )
            if (toDelete.length > 0) {
              await tx
                .delete(landingPages)
                .where(
                  and(
                    eq(landingPages.offerId, params.id),
                    inArray(landingPages.id, toDelete)
                  )
                )
            }

            // Update or Insert
            for (const lp of validLps) {
              if (lp.id) {
                await tx.update(landingPages)
                  .set({
                    name: lp.name!,
                    url: lp.url!,
                    weight: lp.weight,
                    status: lp.status,
                  })
                  .where(eq(landingPages.id, lp.id))
              } else {
                await tx.insert(landingPages)
                  .values({
                    offerId: params.id,
                    name: lp.name!,
                    url: lp.url!,
                    weight: lp.weight,
                    status: lp.status,
                  })
              }
            }
          } else {
            // If empty array, delete all LPs for this offer
            await tx
              .delete(landingPages)
              .where(eq(landingPages.offerId, params.id))
          }
        }

        return { success: true, data: offer }
      })
    },
    { body: updateOfferSchema }
  )

  // ── POST /:id/delete ────────────────────────────────────────────
  .post("/:id/delete", async ({ params }) => {
    const [deleted] = await db
      .delete(offers)
      .where(eq(offers.id, params.id))
      .returning()
    if (!deleted) throw new AppError(404, "Offer not found")
    return { success: true, data: { id: deleted.id } }
  })

  // ── Landing Pages ──────────────────────────────────────────────
  .get("/:id/landing-pages", async ({ params }) => {
    const lps = await db
      .select()
      .from(landingPages)
      .where(eq(landingPages.offerId, params.id))
      .orderBy(desc(landingPages.createdAt))
    return { success: true, data: lps }
  })

  .post(
    "/:id/landing-pages",
    async ({ params, body }) => {
      const [lp] = await db
        .insert(landingPages)
        .values({
          offerId: params.id,
          name: body.name!,
          url: body.url!,
          weight: body.weight,
          status: body.status,
        })
        .returning()
      return { success: true, data: lp, status: 201 }
    },
    { body: createLandingPageSchema }
  )

  .post(
    "/:id/landing-pages/:lpId",
    async ({ params, body }) => {
      const [lp] = await db
        .update(landingPages)
        .set({
          name: body.name ?? undefined,
          url: body.url ?? undefined,
          weight: body.weight,
          status: body.status,
        })
        .where(eq(landingPages.id, params.lpId))
        .returning()
      if (!lp) throw new AppError(404, "Landing page not found")
      return { success: true, data: lp }
    },
    { body: updateLandingPageSchema }
  )

  .post("/:id/landing-pages/:lpId/delete", async ({ params }) => {
    await db.delete(landingPages).where(eq(landingPages.id, params.lpId))
    return { success: true }
  })

  // ── Offer Affiliates ───────────────────────────────────────────
  .get("/:id/affiliates", async ({ params }) => {
    const data = await db
      .select({
        id: offerAffiliates.id,
        offerId: offerAffiliates.offerId,
        affiliateId: offerAffiliates.affiliateId,
        status: offerAffiliates.status,
        customPayout: offerAffiliates.customPayout,
        customRevenue: offerAffiliates.customRevenue,
        createdAt: offerAffiliates.createdAt,
        affiliateName: affiliates.name,
        affiliateEmail: affiliates.email,
      })
      .from(offerAffiliates)
      .innerJoin(affiliates, eq(offerAffiliates.affiliateId, affiliates.id))
      .where(eq(offerAffiliates.offerId, params.id))
      .orderBy(desc(offerAffiliates.createdAt))
    return { success: true, data }
  })

  .post(
    "/:id/affiliates",
    async ({ params, body }) => {
      const [oa] = await db
        .insert(offerAffiliates)
        .values({ offerId: params.id, ...body })
        .onConflictDoNothing()
        .returning()
      return { success: true, data: oa, status: 201 }
    },
    { body: assignAffiliateSchema }
  )

  .post(
    "/:id/affiliates/:oaId",
    async ({ params, body }) => {
      const values: Record<string, unknown> = body
      if (body.status === "approved") values["approvedAt"] = new Date()
      const [oa] = await db
        .update(offerAffiliates)
        .set(values)
        .where(eq(offerAffiliates.id, params.oaId))
        .returning()
      if (!oa) throw new AppError(404, "Assignment not found")
      return { success: true, data: oa }
    },
    { body: updateOfferAffiliateSchema }
  )

  .post(
    "/:id/affiliates/bulk",
    async ({ params, body }) => {
      for (const affId of body.affiliateIds) {
        await db
          .update(offerAffiliates)
          .set({
            status: body.status,
            ...(body.status === "approved" ? { approvedAt: new Date() } : {}),
          })
          .where(
            and(
              eq(offerAffiliates.offerId, params.id),
              eq(offerAffiliates.affiliateId, affId)
            )
          )
      }
      return { success: true }
    },
    { body: bulkOfferAffiliateSchema }
  )

  // ── Tracking URL ───────────────────────────────────────────────
  .get(
    "/:id/tracking-url",
    async ({ params, query }) => {
      const {
        trackingDomain: td,
        affiliateId,
        landingPageId,
      } = trackingUrlQuerySchema.parse(query)
      const trackingDomain =
        td || process.env["TRACKING_URL"] || "http://localhost:3002"
      const base = `${trackingDomain}/c`
      const searchParams = new URLSearchParams({ o: params.id, a: affiliateId })
      if (landingPageId) searchParams.set("lp", landingPageId)
      return {
        success: true,
        data: { url: `${base}?${searchParams.toString()}` },
      }
    },
    { query: trackingUrlQuerySchema }
  )
