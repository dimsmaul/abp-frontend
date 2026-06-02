export interface AppUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager'
  department?: string
  image?: string | null
}
