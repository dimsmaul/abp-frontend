import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  leaveBalanceService,
  type LeaveBalance,
  type UpdateLeaveBalanceInput,
} from '@/services/leave-balance.service'

export function useLeaveBalances(params?: { page?: number; limit?: number; year?: number }) {
  const queryClient = useQueryClient()
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const year = params?.year ?? new Date().getFullYear()

  const listQuery = useQuery({
    queryKey: ['leave-balances', year, page, limit],
    queryFn: () => leaveBalanceService.getAll({ page, limit, year }),
  })

  const raw = listQuery.data as
    | { items: LeaveBalance[]; meta?: { page: number; limit: number; total: number; totalPages: number } }
    | LeaveBalance[]
    | undefined
  const balances: LeaveBalance[] = Array.isArray(raw) ? raw : raw?.items ?? []
  const meta = Array.isArray(raw) ? undefined : raw?.meta

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateLeaveBalanceInput }) =>
      leaveBalanceService.updateForUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] })
    },
  })

  return {
    balances,
    meta,
    year,
    isLoading: listQuery.isLoading,
    updateBalance: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
