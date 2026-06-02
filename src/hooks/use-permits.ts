import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permitService, type PermitStatus, type ValidatePermitInput, type Permit } from '@/services/permit.service'

export function usePermits(params?: { status?: PermitStatus | 'all'; page?: number; limit?: number }) {
  const queryClient = useQueryClient()
  const status = params?.status ?? 'all'
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20

  const listQuery = useQuery({
    queryKey: ['permits', status, page, limit],
    queryFn: () => permitService.getAll({ status, page, limit }),
  })

  const raw = listQuery.data as
    | { items: Permit[]; meta?: { page: number; limit: number; total: number; totalPages: number } }
    | Permit[]
    | undefined
  const permits: Permit[] = Array.isArray(raw) ? raw : raw?.items ?? []
  const meta = Array.isArray(raw) ? undefined : raw?.meta

  const validateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidatePermitInput }) =>
      permitService.validate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permits'] })
    },
  })

  return {
    permits,
    meta,
    isLoading: listQuery.isLoading,
    validate: validateMutation.mutateAsync,
    isValidating: validateMutation.isPending,
  }
}
