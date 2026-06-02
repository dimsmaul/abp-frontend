import api from '@/lib/axios'

export const reportService = {
  getAllReports: async (params?: any) => {
    const res = await api.get('/api/web/reports', { params })
    return res.data.data
  },

  getDetail: async (id: string) => {
    const res = await api.get(`/api/web/reports/${id}`)
    return res.data.data
  },

  validateReport: async (id: string, data: any) => {
    const res = await api.patch(`/api/web/reports/${id}/validate`, data)
    return res.data.data
  }
}
