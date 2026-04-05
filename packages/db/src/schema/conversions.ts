import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  index,
} from "drizzle-orm/pg-core"
import { generateId } from "@adscrush/shared/lib/id"
import { clicks } from "./clicks"

export const conversions = pgTable(
  "conversions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("conversion")),
    clickId: text("click_id").notNull().references(() => clicks.id, {
      onDelete: "restrict",
    }),
    offerId: text("offer_id").notNull(),
    affiliateId: text("affiliate_id").notNull(),
    advertiserId: text("advertiser_id").notNull(),
    event: text("event").notNull().default("conversion"),
    payout: numeric("payout", { precision: 10, scale: 4 })
      .notNull()
      .default("0"),
    revenue: numeric("revenue", { precision: 10, scale: 4 })
      .notNull()
      .default("0"),
    saleAmount: numeric("sale_amount", { precision: 10, scale: 4 }),
    currency: text("currency").notNull().default("USD"),
    status: text("status").notNull().default("approved"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    isDuplicate: boolean("is_duplicate").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("conversions_click_idx").on(table.clickId),
    index("conversions_offer_created_idx").on(table.offerId, table.createdAt),
    index("conversions_affiliate_created_idx").on(
      table.affiliateId,
      table.createdAt
    ),
  ]
)

export type Conversion = typeof conversions.$inferSelect
export type NewConversion = typeof conversions.$inferInsert
