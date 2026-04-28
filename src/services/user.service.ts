import api from '@/lib/axios'

export const userService = {
  getUsers: async () => {
    const res = await api.get('/api/web/users')
    return res.data.data
  },
  
  getUser: async (id: string) => {
    const res = await api.get(`/api/web/users/${id}`)
    return res.data.data
  },

  createUser: async (data: any) => {
    const res = await api.post('/api/web/users', data)
    return res.data.data
  },

  updateUser: async (id: string, data: any) => {
    const res = await api.patch(`/api/web/users/${id}`, data)
    return res.data.data
  }
}
