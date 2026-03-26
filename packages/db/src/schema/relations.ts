import { relations } from "drizzle-orm"
import { users } from "./auth"
import { employees, employeeAffiliateAccess, employeeAdvertiserAccess } from "./employees"
import { advertisers } from "./advertisers"
import { affiliates } from "./affiliates"
import { offers } from "./offers"
import { landingPages } from "./landing-pages"
import { offerAffiliates } from "./offer-affiliates"
import { clicks } from "./clicks"
import { conversions } from "./conversions"

export const usersRelations = relations(users, ({ one }) => ({
  employee: one(employees, {
    fields: [users.id],
    references: [employees.userId],
  }),
}))

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  managedAdvertisers: many(advertisers),
  managedAffiliates: many(affiliates),
  affiliateAccess: many(employeeAffiliateAccess),
  advertiserAccess: many(employeeAdvertiserAccess),
}))

export const employeeAffiliateAccessRelations = relations(
  employeeAffiliateAccess,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeAffiliateAccess.employeeId],
      references: [employees.id],
    }),
    affiliate: one(affiliates, {
      fields: [employeeAffiliateAccess.affiliateId],
      references: [affiliates.id],
    }),
  })
)

export const employeeAdvertiserAccessRelations = relations(
  employeeAdvertiserAccess,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeAdvertiserAccess.employeeId],
      references: [employees.id],
    }),
    advertiser: one(advertisers, {
      fields: [employeeAdvertiserAccess.advertiserId],
      references: [advertisers.id],
    }),
  })
)

export const advertisersRelations = relations(
  advertisers,
  ({ one, many }) => ({
    accountManager: one(employees, {
      fields: [advertisers.accountManagerId],
      references: [employees.id],
    }),
    offers: many(offers),
  })
)

export const affiliatesRelations = relations(
  affiliates,
  ({ one, many }) => ({
    accountManager: one(employees, {
      fields: [affiliates.accountManagerId],
      references: [employees.id],
    }),
    offerAffiliates: many(offerAffiliates),
  })
)

export const offersRelations = relations(offers, ({ one, many }) => ({
  advertiser: one(advertisers, {
    fields: [offers.advertiserId],
    references: [advertisers.id],
  }),
  landingPages: many(landingPages),
  offerAffiliates: many(offerAffiliates),
}))

export const landingPagesRelations = relations(landingPages, ({ one }) => ({
  offer: one(offers, {
    fields: [landingPages.offerId],
    references: [offers.id],
  }),
}))

export const offerAffiliatesRelations = relations(
  offerAffiliates,
  ({ one }) => ({
    offer: one(offers, {
      fields: [offerAffiliates.offerId],
      references: [offers.id],
    }),
    affiliate: one(affiliates, {
      fields: [offerAffiliates.affiliateId],
      references: [affiliates.id],
    }),
  })
)

export const clicksRelations = relations(clicks, ({ many }) => ({
  conversions: many(conversions),
}))

export const conversionsRelations = relations(conversions, ({ one }) => ({
  click: one(clicks, {
    fields: [conversions.clickId],
    references: [clicks.id],
  }),
}))
