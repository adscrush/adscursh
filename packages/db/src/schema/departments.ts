import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { generateId } from "@adscrush/shared/lib/id"

export const departments = pgTable(
  "departments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("dept")),
    name: text("name").notNull().unique(),
    description: text("description"),
    status: text("status", {
      enum: ["active", "inactive"],
    })
      .notNull()
      .default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("departments_name_idx").on(table.name)]
)

export type Department = typeof departments.$inferSelect
export type NewDepartment = typeof departments.$inferInsert
