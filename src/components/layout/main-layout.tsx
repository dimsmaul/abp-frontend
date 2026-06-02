import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Users,
  Building2,
  FileCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'manager'] },
  { label: 'Monitoring Presensi', icon: MapPin, href: '/attendance-list', roles: ['admin', 'manager'] },
  { label: 'Laporan', icon: FileText, href: '/reports', roles: ['admin', 'manager'] },
  { label: 'Pengajuan', icon: FileCheck, href: '/permits', roles: ['admin', 'manager'] },
  { label: 'Kantor', icon: Building2, href: '/offices', roles: ['admin'] },
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

  const rawRole = (session?.user as any)?.role
  const role = rawRole && ['admin', 'manager', 'employee'].includes(rawRole) ? rawRole : null

  if (!role) return null

  const activeItem = navItems.find((i) => i.href === location.pathname)
  const pageTitle = activeItem?.label ?? 'FieldTrack'
  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? '?'

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
            .filter((item) => item.roles.includes(role))
            .map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-10 font-medium',
                      isActive && 'bg-secondary font-semibold',
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
        </nav>
      </aside>

      {/* Right column: navbar + content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-14 border-b flex items-center justify-between px-6 bg-background">
          <h2 className="text-base font-semibold tracking-tight">{pageTitle}</h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-9 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                  {initial}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium truncate max-w-[160px]">
                    {session?.user?.name}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{role}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserIcon size={16} />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut size={16} />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
