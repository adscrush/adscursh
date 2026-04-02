import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { users } from "./auth"
import { generateId } from "@adscrush/shared/lib/id"

export const employees = pgTable(
  "employees",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("employee")),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    department: text("department"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("employees_user_id_idx").on(table.userId)]
)

export const employeeAffiliateAccess = pgTable(
  "employee_affiliate_access",
  {
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    affiliateId: text("affiliate_id").notNull(),
  },
  (table) => [
    uniqueIndex("emp_aff_access_idx").on(table.employeeId, table.affiliateId),
  ]
)

export const employeeAdvertiserAccess = pgTable(
  "employee_advertiser_access",
  {
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    advertiserId: text("advertiser_id").notNull(),
  },
  (table) => [
    uniqueIndex("emp_adv_access_idx").on(table.employeeId, table.advertiserId),
  ]
)

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
