import api from '@/lib/axios'

export type PermitStatus = 'pending' | 'approved' | 'rejected'
export type PermitCategory =
  | 'leave'
  | 'sick'
  | 'permit'
  | 'overtime'
  | 'reimburse'
  | 'loan'
// Legacy type field kept for backward-compat with existing rows.
export type PermitType = 'cuti' | 'sakit' | 'izin' | 'dinas'

export interface Permit {
  id: string
  userId: string
  user?: { name: string; department?: string }
  type: PermitType | string
  category?: PermitCategory | string
  description: string
  startDate: string
  endDate: string
  attachmentUrl?: string
  status: PermitStatus
  notes?: string
  daysUsed?: number | null
  overtimeHours?: number | null
  reimburseAmount?: number | null
  reimburseReceiptUrl?: string | null
  loanAmount?: number | null
  loanTenorMonths?: number | null
  createdAt: string
}

export interface ValidatePermitInput {
  // Backend (permit.schema.ts) accepts { status, notes }.
  status: 'approved' | 'rejected'
  notes?: string
}

export const permitService = {
  getAll: async (params?: {
    status?: PermitStatus | 'all'
    category?: PermitCategory | 'all'
    page?: number
    limit?: number
  }) => {
    const cleaned: Record<string, any> = {}
    if (params?.status && params.status !== 'all') cleaned.status = params.status
    if (params?.category && params.category !== 'all') cleaned.category = params.category
    if (params?.page) cleaned.page = params.page
    if (params?.limit) cleaned.limit = params.limit
    const res = await api.get('/api/web/permits', { params: cleaned })
    return res.data.data as
      | { items: Permit[]; meta?: { page: number; limit: number; total: number; totalPages: number } }
      | Permit[]
  },

  validate: async (id: string, data: ValidatePermitInput) => {
    const res = await api.patch(`/api/web/permits/${id}/validate`, data)
    return res.data.data as Permit
  },
}
