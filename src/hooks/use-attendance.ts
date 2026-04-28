import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceService } from '@/services/attendance.service'
import { useState } from 'react'

export function useAttendance() {
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)

  const historyQuery = useQuery({
    queryKey: ['attendance-history'],
    queryFn: () => attendanceService.getHistory()
  })

  const webHistoryQuery = useQuery({
    queryKey: ['attendance-history-web'],
    queryFn: () => attendanceService.getAllHistory()
  })

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  const checkOutMutation = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  const handleAction = async (type: 'check_in' | 'check_out') => {
    setIsProcessing(true)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const formData = new FormData()
      formData.append('latitude', pos.coords.latitude.toString())
      formData.append('longitude', pos.coords.longitude.toString())
      
      if (type === 'check_in') {
        await checkInMutation.mutateAsync(formData)
      } else {
        await checkOutMutation.mutateAsync(formData)
      }
    } catch (error) {
      console.error('Attendance action failed:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    history: historyQuery.data?.items || [],
    webHistory: webHistoryQuery.data?.items || [],
    isLoading: historyQuery.isLoading,
    isWebLoading: webHistoryQuery.isLoading,
    isProcessing,
    handleAction
  }
}
