import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { employees } from "./employees"
import { generateId } from "@adscrush/shared/lib/id"

export const affiliates = pgTable("affiliates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId("affiliate")),
  name: text("name").notNull(),
  companyName: text("company_name"),
  email: text("email").notNull(),
  accountManagerId: text("account_manager_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type Affiliate = typeof affiliates.$inferSelect
export type NewAffiliate = typeof affiliates.$inferInsert
