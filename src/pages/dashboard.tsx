import { useMemo } from 'react'
import { useDashboard } from '@/hooks/use-dashboard'
import { useAttendance } from '@/hooks/use-attendance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, FileText, CheckCircle, Clock } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const chartConfig = {
  checkIn: { label: 'Check-in', color: 'var(--chart-1)' },
  checkOut: { label: 'Check-out', color: 'var(--chart-2)' },
} satisfies ChartConfig

function buildDailySeries(records: any[]) {
  const days: { key: string; label: string }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    days.push({ key, label })
  }

  const map = new Map<string, { checkIn: number; checkOut: number }>()
  for (const { key } of days) map.set(key, { checkIn: 0, checkOut: 0 })

  for (const r of records) {
    if (!r?.serverTime) continue
    const key = new Date(r.serverTime).toISOString().slice(0, 10)
    const bucket = map.get(key)
    if (!bucket) continue
    if (r.type === 'check_in') bucket.checkIn += 1
    else if (r.type === 'check_out') bucket.checkOut += 1
  }

  return days.map(({ key, label }) => ({
    day: label,
    ...(map.get(key) ?? { checkIn: 0, checkOut: 0 }),
  }))
}

export default function DashboardPage() {
  const { summary, isLoadingSummary } = useDashboard()
  const { webHistory, isWebLoading } = useAttendance({ page: 1, limit: 200 })

  const chartData = useMemo(() => buildDailySeries(webHistory ?? []), [webHistory])

  const stats = [
    {
      name: 'Karyawan Hadir',
      value: summary?.todayPresent ?? 0,
      description: 'Hadir hari ini',
      icon: CheckCircle,
    },
    {
      name: 'Karyawan Absen',
      value: summary?.todayAbsent ?? 0,
      description: 'Belum hadir',
      icon: Clock,
    },
    {
      name: 'Laporan Pending',
      value: summary?.pendingReports ?? 0,
      description: 'Menunggu review',
      icon: FileText,
    },
    {
      name: 'Total Karyawan',
      value: summary?.totalEmployees ?? 0,
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
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tren Presensi 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {isWebLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="checkIn" fill="var(--color-checkIn)" radius={4} />
                <Bar dataKey="checkOut" fill="var(--color-checkOut)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
