import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { users } from "./auth"
import { departments } from "./departments"
import { generateId } from "@adscrush/shared/lib/id"
import {
  EMPLOYEE_STATUS,
  EMPLOYEE_STATUS_VALUES,
} from "@adscrush/shared/constants/status"

export const employees = pgTable(
  "employees",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("employee")),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    departmentId: text("department_id").references(() => departments.id),
    department: text("department"),
    status: text("status", {
      enum: EMPLOYEE_STATUS_VALUES,
    })
      .notNull()
      .default(EMPLOYEE_STATUS.ACTIVE),
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
export type EmployeeAffiliateAccess =
  typeof employeeAffiliateAccess.$inferSelect
export type NewEmployeeAffiliateAccess =
  typeof employeeAffiliateAccess.$inferInsert
export type EmployeeAdvertiserAccess =
  typeof employeeAdvertiserAccess.$inferSelect
export type NewEmployeeAdvertiserAccess =
  typeof employeeAdvertiserAccess.$inferInsert
