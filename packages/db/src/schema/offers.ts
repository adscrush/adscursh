import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
} from "drizzle-orm/pg-core"
import { advertisers } from "./advertisers"

export const offers = pgTable("offers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  advertiserId: text("advertiser_id")
    .notNull()
    .references(() => advertisers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  previewUrl: text("preview_url"),
  offerUrl: text("offer_url").notNull(),
  status: text("status").notNull().default("active"),
  payoutType: text("payout_type").notNull().default("CPA"),
  defaultPayout: numeric("default_payout", { precision: 10, scale: 4 })
    .notNull()
    .default("0"),
  defaultRevenue: numeric("default_revenue", { precision: 10, scale: 4 })
    .notNull()
    .default("0"),
  currency: text("currency").notNull().default("USD"),
  targetGeo: text("target_geo"),
  fallbackUrl: text("fallback_url"),
  allowMultiConversion: boolean("allow_multi_conversion")
    .notNull()
    .default(false),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type Offer = typeof offers.$inferSelect
export type NewOffer = typeof offers.$inferInsert
