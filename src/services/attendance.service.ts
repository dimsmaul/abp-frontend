import api from '@/lib/axios'

export const attendanceService = {
  getHistory: async (params?: any) => {
    const res = await api.get('/api/mobile/attendances', { params })
    return res.data.data
  },
  
  getAllHistory: async (params?: any) => {
    const res = await api.get('/api/web/attendances', { params })
    return res.data.data
  },

  checkIn: async (data: FormData) => {
    const res = await api.post('/api/mobile/attendances/check-in', data)
    return res.data.data
  },

  checkOut: async (data: FormData) => {
    const res = await api.post('/api/mobile/attendances/check-out', data)
    return res.data.data
  }
}
