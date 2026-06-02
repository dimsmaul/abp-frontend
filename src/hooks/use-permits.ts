import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permitService, type PermitStatus, type ValidatePermitInput, type Permit } from '@/services/permit.service'

export function usePermits(status?: PermitStatus | 'all') {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['permits', status ?? 'all'],
    queryFn: () => permitService.getAll({ status }),
  })

  const raw = listQuery.data as { items: Permit[] } | Permit[] | undefined
  const permits: Permit[] = Array.isArray(raw) ? raw : raw?.items ?? []

  const validateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidatePermitInput }) =>
      permitService.validate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permits'] })
    },
  })

  return {
    permits,
    isLoading: listQuery.isLoading,
    validate: validateMutation.mutateAsync,
    isValidating: validateMutation.isPending,
  }
}
