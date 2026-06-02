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
  createdAt: string
  updatedAt: string
}

export interface OfficeInput {
  name: string
  address: string
  zoneType: ZoneType
  latitude?: number
  longitude?: number
  radius?: number
  polygon?: number[][]
}

export const officeService = {
  getAll: async () => {
    const res = await api.get('/api/offices')
    return res.data.data as Office[]
  },

  getById: async (id: string) => {
    const res = await api.get(`/api/offices/${id}`)
    return res.data.data as Office
  },

  create: async (data: OfficeInput) => {
    const res = await api.post('/api/offices', data)
    return res.data.data as Office
  },

  update: async (id: string, data: Partial<OfficeInput>) => {
    const res = await api.patch(`/api/offices/${id}`, data)
    return res.data.data as Office
  },

  remove: async (id: string) => {
    const res = await api.delete(`/api/offices/${id}`)
    return res.data.data
  },
}
