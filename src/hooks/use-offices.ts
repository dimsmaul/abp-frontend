import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { officeService, type OfficeInput } from '@/services/office.service'

export function useOffices(params?: { page?: number; limit?: number }) {
  const queryClient = useQueryClient()
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20

  const listQuery = useQuery({
    queryKey: ['offices', page, limit],
    queryFn: () => officeService.getAll({ page, limit }),
  })

  const createMutation = useMutation({
    mutationFn: (data: OfficeInput) => officeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OfficeInput> }) =>
      officeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => officeService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] })
    },
  })

  return {
    offices: listQuery.data?.items ?? [],
    meta: listQuery.data?.meta,
    isLoading: listQuery.isLoading,
    createOffice: createMutation.mutateAsync,
    updateOffice: updateMutation.mutateAsync,
    removeOffice: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}

export function useOffice(id: string | undefined) {
  return useQuery({
    queryKey: ['offices', id],
    queryFn: () => officeService.getById(id!),
    enabled: !!id,
  })
}
