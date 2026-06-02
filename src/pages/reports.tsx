import { useState } from 'react'
import { useReports } from '@/hooks/use-reports'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { DataTable } from '@/components/datatable'

function statusBadge(status: string) {
  if (status === 'approved') return <Badge variant="default">Disetujui</Badge>
  if (status === 'pending') return <Badge variant="secondary">Menunggu</Badge>
  if (status === 'need_revision') return <Badge variant="destructive">Revisi</Badge>
  return <Badge variant="destructive">Ditolak</Badge>
}

export default function ReportsPage() {
  const [page, setPage] = useState(1)
  const limit = 20
  const { reports, meta, isLoading } = useReports({ page, limit })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Laporan Lapangan</h1>
          <p className="text-muted-foreground text-sm">
            Validasi laporan kendala dari karyawan di lapangan.
          </p>
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          <DataTable<any>
            data={reports}
            loading={isLoading}
            column={[
              { label: 'Tanggal', width: '140px' },
              'Karyawan',
              'Kategori',
              { label: 'Deskripsi', className: 'max-w-[300px]' },
              'Status',
              { label: '', width: '60px' },
            ]}
            field={[
              (r) => (
                <span className="text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              ),
              (r) => <span className="font-medium">{r.userName}</span>,
              (r) => (
                <Badge variant="secondary" className="capitalize font-normal">
                  {r.category}
                </Badge>
              ),
              (r) => (
                <p className="truncate text-muted-foreground max-w-[300px]" title={r.description}>
                  {r.description}
                </p>
              ),
              (r) => statusBadge(r.status),
              () => (
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight size={16} />
                </Button>
              ),
            ]}
            rowKey={(r) => r.id}
            pagination={{
              page: meta?.page ?? page,
              totalPages: meta?.totalPages ?? 1,
              total: meta?.total ?? 0,
              limit: meta?.limit ?? limit,
              onPageChange: setPage,
            }}
            empty="Belum ada laporan"
          />
        </CardContent>
      </Card>
    </div>
  )
}
