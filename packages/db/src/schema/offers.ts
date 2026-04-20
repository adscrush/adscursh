import { pgTable, text, timestamp, boolean, numeric } from "drizzle-orm/pg-core"
import { advertisers } from "./advertisers"
import { categories } from "./categories"
import { generateId } from "@adscrush/shared/lib/id"
import {
  OFFER_STATUS,
  OFFER_STATUS_VALUES,
  OFFER_VISIBILITY_VALUES,
} from "@adscrush/shared/constants/status"

export const offers = pgTable("offers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId("offer")),
  advertiserId: text("advertiser_id")
    .notNull()
    .references(() => advertisers.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  logo: text("logo"),
  description: text("description"),
  privateNote: text("private_note"),
  offerUrl: text("offer_url").notNull(),
  status: text("status", {
    enum: OFFER_STATUS_VALUES,
  })
    .notNull()
    .default(OFFER_STATUS.ACTIVE),
  // active, inactive, paused, expired
  visibility: text("visibility", {
    enum: OFFER_VISIBILITY_VALUES,
  })
    .notNull()
    .default("public"), // public, private, exclusive

  // Revenue (Advertiser Pricing)
  revenueType: text("revenue_type").notNull().default("CPA"), // CPA, CPC, CPL, CPS, etc
  defaultRevenue: numeric("default_revenue", { precision: 10, scale: 4 })
    .notNull()
    .default("0"),
  currency: text("currency").notNull().default("USD"),

  // Payout (Affiliate Pricing)
  payoutType: text("payout_type").notNull().default("CPA"), // CPA, CPC, CPL, CPS, etc
  defaultPayout: numeric("default_payout", { precision: 10, scale: 4 })
    .notNull()
    .default("0"),

  targetGeo: text("target_geo"),
  fallbackUrl: text("fallback_url"),
  allowMultiConversion: boolean("allow_multi_conversion")
    .notNull()
    .default(false),

  // Scheduling
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type Offer = typeof offers.$inferSelect
export type NewOffer = typeof offers.$inferInsert
