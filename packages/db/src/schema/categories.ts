import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { generateId } from "@adscrush/shared/lib/id"

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId("cat")),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
