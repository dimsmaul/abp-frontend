import api from '@/lib/axios'

export type AnnouncementPriority = 'low' | 'normal' | 'high'

export interface Announcement {
  id: string
  title: string
  body: string
  priority: AnnouncementPriority
  isPinned: boolean
  publishedBy?: { id: string; name: string | null }
  publishedAt: string
  expiresAt?: string | null
  createdAt: string
}

export interface AnnouncementInput {
  title: string
  body: string
  priority: AnnouncementPriority
  isPinned: boolean
  expiresAt?: string | null
}

export type AnnouncementListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const announcementService = {
  getAll: async (params: { page?: number; limit?: number; priority?: AnnouncementPriority }) => {
    const cleaned: Record<string, any> = {}
    if (params.page) cleaned.page = params.page
    if (params.limit) cleaned.limit = params.limit
    if (params.priority) cleaned.priority = params.priority
    const res = await api.get('/api/web/announcements', { params: cleaned })
    return res.data.data as { items: Announcement[]; meta: AnnouncementListMeta }
  },

  getById: async (id: string) => {
    const res = await api.get(`/api/web/announcements/${id}`)
    return res.data.data as Announcement
  },

  create: async (data: AnnouncementInput) => {
    const res = await api.post('/api/web/announcements', data)
    return res.data.data as Announcement
  },

  update: async (id: string, data: Partial<AnnouncementInput>) => {
    const res = await api.patch(`/api/web/announcements/${id}`, data)
    return res.data.data as Announcement
  },

  remove: async (id: string) => {
    const res = await api.delete(`/api/web/announcements/${id}`)
    return res.data.data
  },
}
