import {
  pgTable,
  text,
  timestamp,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { offers } from "./offers"
import { affiliates } from "./affiliates"

import { generateId } from "@adscrush/shared/lib/id"

export const offerAffiliates = pgTable(
  "offer_affiliates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("offer_affiliate")),
    offerId: text("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "cascade" }),
    affiliateId: text("affiliate_id")
      .notNull()
      .references(() => affiliates.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    customPayout: numeric("custom_payout", { precision: 10, scale: 4 }),
    customRevenue: numeric("custom_revenue", { precision: 10, scale: 4 }),
    approvedAt: timestamp("approved_at"),
    approvedBy: text("approved_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("offer_affiliate_idx").on(table.offerId, table.affiliateId),
  ]
)

export type OfferAffiliate = typeof offerAffiliates.$inferSelect
export type NewOfferAffiliate = typeof offerAffiliates.$inferInsert
