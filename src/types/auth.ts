export interface AppUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'employee'
  department?: string
  image?: string | null
}
