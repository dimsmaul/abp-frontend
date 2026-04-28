import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportService } from '@/services/report.service'
import { useSession } from '@/lib/auth-client'

export function useReports(params?: any) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const user = session?.user as any
  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  const reportsQuery = useQuery({
    queryKey: ['reports', isAdmin, params],
    queryFn: () => isAdmin ? reportService.getAllReports(params) : reportService.getMyReports(params)
  })

  const createMutation = useMutation({
    mutationFn: reportService.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
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
    isAdmin,
    createReport: createMutation.mutateAsync,
    validateReport: validateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isValidating: validateMutation.isPending
  }
}
