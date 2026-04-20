import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core"
import { offers } from "./offers"
import { generateId } from "@adscrush/shared/lib/id"

export const landingPages = pgTable("landing_pages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId("landing_page")),
  offerId: text("offer_id")
    .notNull()
    .references(() => offers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  weight: integer("weight").notNull().default(1),
  status: text("status", { enum: ["active", "inactive"] })
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type LandingPage = typeof landingPages.$inferSelect
export type NewLandingPage = typeof landingPages.$inferInsert
