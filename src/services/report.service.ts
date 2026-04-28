import api from '@/lib/axios'

export const reportService = {
  getMyReports: async (params?: any) => {
    const res = await api.get('/api/mobile/reports', { params })
    return res.data.data
  },

  getAllReports: async (params?: any) => {
    const res = await api.get('/api/web/reports', { params })
    return res.data.data
  },

  getDetail: async (id: string, isAdmin: boolean) => {
    const endpoint = isAdmin ? `/api/web/reports/${id}` : `/api/mobile/reports/${id}`
    const res = await api.get(endpoint)
    return res.data.data
  },

  createReport: async (data: FormData) => {
    const res = await api.post('/api/mobile/reports', data)
    return res.data.data
  },

  validateReport: async (id: string, data: any) => {
    const res = await api.patch(`/api/web/reports/${id}/validate`, data)
    return res.data.data
  }
}
