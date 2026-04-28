import { useDashboard } from '@/hooks/use-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { summary, isLoadingSummary } = useDashboard()

  if (isLoadingSummary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    )
  }

  const stats = [
    {
      name: 'Karyawan Hadir',
      value: summary?.todayPresent || 0,
      description: 'Hadir hari ini',
      icon: CheckCircle,
    },
    {
      name: 'Karyawan Absen',
      value: summary?.todayAbsent || 0,
      description: 'Belum hadir',
      icon: Clock,
    },
    {
      name: 'Laporan Pending',
      value: summary?.pendingReports || 0,
      description: 'Menunggu review',
      icon: FileText,
    },
    {
      name: 'Total Karyawan',
      value: summary?.totalEmployees || 0,
      description: 'Terdaftar di sistem',
      icon: Users,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Status operasional lapangan hari ini.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
