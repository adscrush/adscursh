export interface Employee {
  id: string
  userId: string
  name: string | null
  email: string | null
  role: string | null
  image: string | null
  department: string | null
  status: string
  createdAt: Date
}
