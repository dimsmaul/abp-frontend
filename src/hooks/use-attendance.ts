import { useQuery } from '@tanstack/react-query'
import { attendanceService } from '@/services/attendance.service'

export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number }

export function useAttendance(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20

  const webHistoryQuery = useQuery({
    queryKey: ['attendance-history-web', page, limit],
    queryFn: () => attendanceService.getAllHistory({ page, limit }),
  })

  return {
    webHistory: webHistoryQuery.data?.items || [],
    meta: webHistoryQuery.data?.meta as PaginationMeta | undefined,
    isWebLoading: webHistoryQuery.isLoading,
  }
}
