import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { employees } from "./employees"
import { generateId } from "@adscrush/shared/lib/id"
import {
  ADVERTISER_STATUS,
  ADVERTISER_STATUS_VALUES,
} from "@adscrush/shared/constants/status"

export const advertisers = pgTable("advertisers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId("advertiser")),
  name: text("name").notNull(),
  companyName: text("company_name"),
  email: text("email").notNull().unique(),
  website: text("website"),
  country: text("country"),
  accountManagerId: text("account_manager_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  status: text("status", {
    enum: ADVERTISER_STATUS_VALUES,
  })
    .notNull()
    .default(ADVERTISER_STATUS.ACTIVE),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type Advertiser = typeof advertisers.$inferSelect
export type NewAdvertiser = typeof advertisers.$inferInsert
