import { useState } from 'react'
import { useAttendance } from '@/hooks/use-attendance'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { DataTable } from '@/components/datatable'

export default function AttendanceListPage() {
  const [page, setPage] = useState(1)
  const limit = 20
  const { webHistory, meta, isWebLoading } = useAttendance({ page, limit })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monitoring Presensi</h1>
        <p className="text-muted-foreground text-sm">Pantau kehadiran seluruh karyawan secara real-time.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable<any>
            data={webHistory}
            loading={isWebLoading}
            column={[
              { label: 'Waktu', width: '180px' },
              'Karyawan',
              'Tipe',
              'Lokasi',
              'Status Zona',
              { label: '', width: '80px' },
            ]}
            field={[
              (item) => (
                <span className="text-muted-foreground">
                  {new Date(item.serverTime).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              ),
              (item) => <span className="font-medium">{item.userName}</span>,
              (item) => (
                <Badge variant="secondary" className="capitalize font-normal">
                  {String(item.type).replace('_', ' ')}
                </Badge>
              ),
              (item) => (
                <span
                  className="max-w-[200px] truncate text-muted-foreground block"
                  title={item.locationName}
                >
                  {item.locationName}
                </span>
              ),
              (item) => (
                <Badge variant={item.isWithinZone ? 'default' : 'destructive'}>
                  {item.isWithinZone ? 'Dalam Zona' : 'Luar Zona'}
                </Badge>
              ),
              (item) => (
                <Button variant="ghost" size="sm" asChild>
                  <a href={item.photoUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    <ExternalLink size={14} />
                    Foto
                  </a>
                </Button>
              ),
            ]}
            rowKey={(item) => item.id}
            pagination={{
              page: meta?.page ?? page,
              totalPages: meta?.totalPages ?? 1,
              total: meta?.total ?? 0,
              limit: meta?.limit ?? limit,
              onPageChange: setPage,
            }}
            empty="Belum ada data presensi"
          />
        </CardContent>
      </Card>
    </div>
  )
}
