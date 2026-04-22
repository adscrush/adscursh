import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core"
import { generateId } from "@adscrush/shared/lib/id"
import { offers } from "./offers"
import { affiliates } from "./affiliates"
import { advertisers } from "./advertisers"
import { landingPages } from "./landing-pages"

export const clicks = pgTable(
  "clicks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("click")),
    offerId: text("offer_id").notNull().references(() => offers.id, {
      onDelete: "restrict",
    }),
    affiliateId: text("affiliate_id").notNull().references(() => affiliates.id, {
      onDelete: "restrict",
    }),
    advertiserId: text("advertiser_id").notNull().references(
      () => advertisers.id,
      { onDelete: "restrict" }
    ),
    landingPageId: text("landing_page_id").references(() => landingPages.id, {
      onDelete: "restrict",
    }),
    ipAddress: text("ip_address"),
    geoCountry: text("geo_country"),
    geoCity: text("geo_city"),
    geoState: text("geo_state"),
    userAgent: text("user_agent"),
    referer: text("referer"),
    deviceType: text("device_type"),
    os: text("os"),
    browser: text("browser"),
    affClickId: text("aff_click_id"),
    subAffId: text("sub_aff_id"),
    affSub1: text("aff_sub1"),
    affSub2: text("aff_sub2"),
    affSub3: text("aff_sub3"),
    affSub4: text("aff_sub4"),
    affSub5: text("aff_sub5"),
    affSub6: text("aff_sub6"),
    affSub7: text("aff_sub7"),
    affSub8: text("aff_sub8"),
    affSub9: text("aff_sub9"),
    affSub10: text("aff_sub10"),
    source: text("source"),
    campaign: text("campaign"),
    isUnique: boolean("is_unique").notNull().default(true),
    redirectUrl: text("redirect_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("clicks_offer_created_idx").on(table.offerId, table.createdAt),
    index("clicks_affiliate_created_idx").on(
      table.affiliateId,
      table.createdAt
    ),
    index("clicks_advertiser_created_idx").on(
      table.advertiserId,
      table.createdAt
    ),
  ]
)

export type Click = typeof clicks.$inferSelect
export type NewClick = typeof clicks.$inferInsert
