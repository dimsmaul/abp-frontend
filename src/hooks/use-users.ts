import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'

export function useUsers(params?: { page?: number; limit?: number }) {
  const queryClient = useQueryClient()

  const page = params?.page ?? 1
  const limit = params?.limit ?? 20

  const usersQuery = useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => userService.getUsers({ page, limit })
  })

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return {
    users: Array.isArray(usersQuery.data) ? usersQuery.data : usersQuery.data?.items ?? [],
    meta: (Array.isArray(usersQuery.data) ? undefined : usersQuery.data?.meta) as
      | { page: number; limit: number; total: number; totalPages: number }
      | undefined,
    isLoading: usersQuery.isLoading,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending
  }
}
