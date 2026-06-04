import { useEffect, useState } from 'react'
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
  CheckCheck,
  Calendar,
  Megaphone,
  LogOut,
  User as UserIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SIDEBAR_KEY = 'fieldtrack:sidebar-collapsed'

type Role = 'admin' | 'manager' | 'employee'
type NavItem = { label: string; icon: any; href: string; roles: Role[] }
type NavGroup = { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { label: 'Monitoring Presensi', icon: MapPin, href: '/attendance-list', roles: ['admin', 'manager'] },
      { label: 'Laporan', icon: FileText, href: '/reports', roles: ['admin', 'manager'] },
      { label: 'Persetujuan', icon: CheckCheck, href: '/permits', roles: ['admin', 'manager'] },
      { label: 'Pengumuman', icon: Megaphone, href: '/announcements', roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { label: 'Kantor', icon: Building2, href: '/offices', roles: ['admin'] },
      { label: 'Manajemen User', icon: Users, href: '/users', roles: ['admin'] },
      { label: 'Saldo Cuti', icon: Calendar, href: '/leave-balances', roles: ['admin'] },
    ],
  },
]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  })

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const rawRole = (session?.user as any)?.role
  const role = rawRole && ['admin', 'manager', 'employee'].includes(rawRole) ? rawRole : null

  if (!role) return null

  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? '?'
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'border-r flex flex-col overflow-hidden transition-[width] duration-200 ease-in-out',
          collapsed ? 'w-0' : 'w-64',
        )}
      >
        <div className="p-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin size={16} />
            </div>
            <span className="text-lg font-semibold tracking-tight">FieldTrack</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-5 min-w-[14rem]">
          {navGroups
            .map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role as Role)) }))
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="text-muted-foreground px-3 text-[10px] font-semibold uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map((item) => {
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
              </div>
            ))}
        </nav>
      </aside>

      {/* Right column: navbar + content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          >
            <ToggleIcon size={18} />
          </Button>

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
