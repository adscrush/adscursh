import Elysia from "elysia"
import { eq, like, sql, and, desc } from "@adscrush/db/drizzle"
import { categories } from "@adscrush/db/schema"
import { db } from "~/lib/db"
import { AppError } from "~/utils/errors"
import { requireAuth } from "~/middleware/auth.middleware"
import { listQuerySchema, createCategorySchema } from "./config"

export const categoryRoutes = new Elysia({ prefix: "/categories" })
  .use(requireAuth)

  .get("/", async ({ query }) => {
    const { page, perPage, name } = listQuerySchema.parse(query)
    const offset = (page - 1) * perPage

    const where = name ? like(categories.name, `%${name}%`) : undefined

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(categories)
        .where(where)
        .limit(perPage)
        .offset(offset)
        .orderBy(desc(categories.createdAt)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(categories)
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
  })

  .post("/", async ({ body }) => {
    const [category] = await db.insert(categories).values(body).returning()
    return { success: true, data: category, status: 201 }
  }, { body: createCategorySchema })

  .post("/:id", async ({ params, body }) => {
    const [category] = await db
      .update(categories)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(categories.id, params.id))
      .returning()
    if (!category) throw new AppError(404, "Category not found")
    return { success: true, data: category }
  }, { body: createCategorySchema.partial() })

  .post("/:id/delete", async ({ params }) => {
    // Check if category is assigned to any offers
    const { offers } = await import("@adscrush/db/schema")
    const assignedOffers = await db
      .select({ id: offers.id })
      .from(offers)
      .where(eq(offers.categoryId, params.id))
      .limit(1)

    if (assignedOffers.length > 0) {
      throw new AppError(400, "Category cannot be deleted as it is assigned to one or more offers")
    }

    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, params.id))
      .returning()
    if (!deleted) throw new AppError(404, "Category not found")
    return { success: true, data: { id: deleted.id } }
  })
