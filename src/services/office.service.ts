import api from '@/lib/axios'

export type ZoneType = 'radius' | 'polygon'

export interface Office {
  id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  radius?: number
  zoneType: ZoneType
  polygon?: number[][]
  province?: string | null
  regency?: string | null
  workStartTime?: string | null
  workEndTime?: string | null
  lateThresholdMinutes?: number | null
  createdAt: string
  updatedAt: string
}

export interface OfficeInput {
  name: string
  address: string
  zoneType: ZoneType
  latitude?: number | null
  longitude?: number | null
  radius?: number | null
  polygon?: number[][] | null
  province?: string | null
  regency?: string | null
  workStartTime?: string | null
  workEndTime?: string | null
  lateThresholdMinutes?: number | null
}

export type OfficeListMeta = { page: number; limit: number; total: number; totalPages: number }

export const officeService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get('/api/web/offices', { params })
    return res.data.data as { items: Office[]; meta: OfficeListMeta }
  },

  getById: async (id: string) => {
    const res = await api.get(`/api/web/offices/${id}`)
    return res.data.data as Office
  },

  create: async (data: OfficeInput) => {
    const res = await api.post('/api/web/offices', data)
    return res.data.data as Office
  },

  update: async (id: string, data: Partial<OfficeInput>) => {
    const res = await api.patch(`/api/web/offices/${id}`, data)
    return res.data.data as Office
  },

  remove: async (id: string) => {
    const res = await api.delete(`/api/web/offices/${id}`)
    return res.data.data
  },
}
