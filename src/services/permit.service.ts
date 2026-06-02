import api from '@/lib/axios'

export type PermitStatus = 'pending' | 'approved' | 'rejected'
export type PermitType = 'cuti' | 'sakit' | 'izin' | 'dinas'

export interface Permit {
  id: string
  userId: string
  user?: { name: string; department?: string }
  type: PermitType | string
  description: string
  startDate: string
  endDate: string
  attachmentUrl?: string
  status: PermitStatus
  notes?: string
  createdAt: string
}

export interface ValidatePermitInput {
  status: 'approved' | 'rejected'
  notes?: string
}

export const permitService = {
  getAll: async (params?: { status?: PermitStatus | 'all'; page?: number; limit?: number }) => {
    const cleaned: Record<string, any> = {}
    if (params?.status && params.status !== 'all') cleaned.status = params.status
    if (params?.page) cleaned.page = params.page
    if (params?.limit) cleaned.limit = params.limit
    const res = await api.get('/api/permits', { params: cleaned })
    return res.data.data as
      | { items: Permit[]; meta?: { page: number; limit: number; total: number; totalPages: number } }
      | Permit[]
  },

  validate: async (id: string, data: ValidatePermitInput) => {
    const res = await api.patch(`/api/permits/${id}/validate`, data)
    return res.data.data as Permit
  },
}
