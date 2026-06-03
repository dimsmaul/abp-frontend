import api from '@/lib/axios'

export interface LeaveBalance {
  userId: string
  user?: { id: string; name: string; department?: string | null }
  year: number
  totalDays: number
  usedDays: number
  remainingDays: number
  notes?: string | null
}

export interface UpdateLeaveBalanceInput {
  year: number
  totalDays: number
  usedDays?: number
  notes?: string
}

export const leaveBalanceService = {
  getAll: async (params?: { page?: number; limit?: number; year?: number }) => {
    const res = await api.get('/api/web/leave-balances', { params })
    return res.data.data as
      | { items: LeaveBalance[]; meta?: { page: number; limit: number; total: number; totalPages: number } }
      | LeaveBalance[]
  },

  updateForUser: async (userId: string, data: UpdateLeaveBalanceInput) => {
    const res = await api.patch(`/api/web/leave-balances/${userId}`, data)
    return res.data.data as LeaveBalance
  },
}
