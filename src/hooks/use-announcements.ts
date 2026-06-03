import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  announcementService,
  type AnnouncementInput,
  type AnnouncementPriority,
} from '@/services/announcement.service'

export function useAnnouncements(params?: {
  page?: number
  limit?: number
  priority?: AnnouncementPriority
}) {
  const queryClient = useQueryClient()
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const priority = params?.priority

  const listQuery = useQuery({
    queryKey: ['announcements', page, limit, priority ?? 'all'],
    queryFn: () => announcementService.getAll({ page, limit, priority }),
  })

  const createMutation = useMutation({
    mutationFn: (data: AnnouncementInput) => announcementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AnnouncementInput> }) =>
      announcementService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => announcementService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })

  return {
    announcements: listQuery.data?.items ?? [],
    meta: listQuery.data?.meta,
    isLoading: listQuery.isLoading,
    createAnnouncement: createMutation.mutateAsync,
    updateAnnouncement: updateMutation.mutateAsync,
    removeAnnouncement: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}

export function useAnnouncement(id: string | undefined) {
  return useQuery({
    queryKey: ['announcements', id],
    queryFn: () => announcementService.getById(id!),
    enabled: !!id,
  })
}
