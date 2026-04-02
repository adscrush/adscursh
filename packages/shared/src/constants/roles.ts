
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  ADVERTISER: "advertiser",
  AFFILIATE: "affiliate",
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ALL_ROLES = Object.values(ROLES)
export const INTERNAL_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE] as const
export const EXTERNAL_ROLES = [ROLES.ADVERTISER, ROLES.AFFILIATE] as const