import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'

export function useDashboard() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getSummary()
  })

  const mapPointsQuery = useQuery({
    queryKey: ['map-points'],
    queryFn: () => dashboardService.getMapPoints()
  })

  return {
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,
    mapPoints: mapPointsQuery.data?.points || [],
    isLoadingMap: mapPointsQuery.isLoading
  }
}
