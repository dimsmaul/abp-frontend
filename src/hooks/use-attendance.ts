import { useQuery } from '@tanstack/react-query'
import { attendanceService } from '@/services/attendance.service'

export function useAttendance() {
  const webHistoryQuery = useQuery({
    queryKey: ['attendance-history-web'],
    queryFn: () => attendanceService.getAllHistory()
  })

  return {
    webHistory: webHistoryQuery.data?.items || [],
    isWebLoading: webHistoryQuery.isLoading,
  }
}
