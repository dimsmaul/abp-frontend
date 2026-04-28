import api from '@/lib/axios'

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/api/web/dashboard/summary')
    return res.data.data
  },

  getMapPoints: async (date?: string) => {
    const res = await api.get('/api/web/dashboard/map-points', { params: { date } })
    return res.data.data
  }
}
