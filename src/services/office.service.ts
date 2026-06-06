import api from '@/lib/axios'

export type ZoneType = 'radius' | 'polygon'
export type OfficeStatus = 'active' | 'disabled'

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
  status: OfficeStatus
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
  status?: OfficeStatus
  workStartTime?: string | null
  workEndTime?: string | null
  lateThresholdMinutes?: number | null
}

export type OfficeListMeta = { page: number; limit: number; total: number; totalPages: number }

export const officeService = {
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: OfficeStatus | 'all'
  }) => {
    // Admin needs to see disabled offices too — default to 'all' so the
    // toggle in the table actually exposes them. Override per call when
    // needed.
    const res = await api.get('/api/web/offices', {
      params: { status: 'all', ...params },
    })
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
