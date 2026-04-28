import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  MapPin, 
  FileText, 
  Users, 
  LogOut,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'manager', 'employee'] },
  { label: 'Presensi', icon: MapPin, href: '/attendance', roles: ['employee'] },
  { label: 'Monitoring Presensi', icon: MapPin, href: '/attendance-list', roles: ['admin', 'manager'] },
  { label: 'Laporan', icon: FileText, href: '/reports', roles: ['admin', 'manager', 'employee'] },
  { label: 'Manajemen User', icon: Users, href: '/users', roles: ['admin'] },
]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const role = (session?.user as any)?.role || 'employee'

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin size={16} />
            </div>
            <span className="text-lg font-semibold tracking-tight">FieldTrack</span>
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          {navItems
            .filter(item => item.roles.includes(role))
            .map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-10 font-medium',
                      isActive && 'bg-secondary font-semibold'
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {isActive && <ChevronRight size={14} className="ml-auto text-muted-foreground" />}
                  </Button>
                </Link>
              )
            })}
        </nav>

        <div className="p-3 mt-auto border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
              {session?.user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
