import api from '@/lib/axios'

export const attendanceService = {
  getAllHistory: async (params?: any) => {
    const res = await api.get('/api/web/attendances', { params })
    return res.data.data
  },
}
