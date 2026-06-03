import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import LoginPage from '@/pages/login'
import RegisterPage from '@/pages/register'
import DashboardPage from '@/pages/dashboard'
import AttendanceListPage from '@/pages/attendance-list'
import ReportsPage from '@/pages/reports'
import UsersPage from '@/pages/users'
import OfficesPage from '@/pages/offices'
import OfficeLocationPage from '@/pages/office-location'
import PermitsPage from '@/pages/permits'
import LeaveBalancesPage from '@/pages/leave-balances'
import ProfilePage from '@/pages/profile'
import { useSession } from '@/lib/auth-client'

// Guest Guard Component
const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending } = useSession()
  
  if (isPending) return null
  if (session) return <Navigate to="/" replace />
  
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestGuard>
        <RegisterPage />
      </GuestGuard>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: (
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        ),
      },
      {
        path: '/attendance-list',
        element: (
          <MainLayout>
            <AttendanceListPage />
          </MainLayout>
        ),
      },
      {
        path: '/reports',
        element: (
          <MainLayout>
            <ReportsPage />
          </MainLayout>
        ),
      },
      {
        path: '/users',
        element: (
          <MainLayout>
            <UsersPage />
          </MainLayout>
        ),
      },
      {
        path: '/profile',
        element: (
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        ),
      },
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          {
            path: '/offices',
            element: (
              <MainLayout>
                <OfficesPage />
              </MainLayout>
            ),
          },
          {
            path: '/offices/:id/location',
            element: (
              <MainLayout>
                <OfficeLocationPage />
              </MainLayout>
            ),
          },
          {
            path: '/leave-balances',
            element: (
              <MainLayout>
                <LeaveBalancesPage />
              </MainLayout>
            ),
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['admin', 'manager']} />,
        children: [
          {
            path: '/permits',
            element: (
              <MainLayout>
                <PermitsPage />
              </MainLayout>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
