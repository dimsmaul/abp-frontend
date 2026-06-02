import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportService } from '@/services/report.service'

export function useReports(params?: any) {
  const queryClient = useQueryClient()

  const reportsQuery = useQuery({
    queryKey: ['reports', params],
    queryFn: () => reportService.getAllReports(params)
  })

  const validateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => reportService.validateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
  })

  return {
    reports: reportsQuery.data?.items || [],
    isLoading: reportsQuery.isLoading,
    validateReport: validateMutation.mutateAsync,
    isValidating: validateMutation.isPending
  }
}
