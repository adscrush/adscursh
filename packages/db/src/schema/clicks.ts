import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core"

export const clicks = pgTable(
  "clicks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    offerId: text("offer_id").notNull(),
    affiliateId: text("affiliate_id").notNull(),
    advertiserId: text("advertiser_id").notNull(),
    landingPageId: text("landing_page_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    referer: text("referer"),
    deviceType: text("device_type"),
    os: text("os"),
    browser: text("browser"),
    affClickId: text("aff_click_id"),
    subAffId: text("sub_aff_id"),
    source: text("source"),
    isUnique: boolean("is_unique").default(true),
    redirectUrl: text("redirect_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("clicks_offer_created_idx").on(table.offerId, table.createdAt),
    index("clicks_affiliate_created_idx").on(
      table.affiliateId,
      table.createdAt
    ),
  ]
)

export type Click = typeof clicks.$inferSelect
export type NewClick = typeof clicks.$inferInsert
