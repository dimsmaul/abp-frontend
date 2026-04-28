import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/lib/auth-client'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
