export type Role =
  | "super_admin"
  | "admin"
  | "employee"
  | "advertiser"
  | "affiliate"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  id: string
  userId: string
  expiresAt: Date
}

export interface SessionContext {
  user: AuthUser
  session: AuthSession
}

// Helper to check role
export function isAdmin(user: AuthUser): boolean {
  return user.role === "super_admin" || user.role === "admin"
}

export function isEmployee(user: AuthUser): boolean {
  return user.role === "employee"
}

export function isInternal(user: AuthUser): boolean {
  return isAdmin(user) || isEmployee(user)
}
