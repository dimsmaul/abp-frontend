import { useReports } from '@/hooks/use-reports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, FileText, ChevronRight } from 'lucide-react'

export default function ReportsPage() {
  const { reports, isLoading, isAdmin } = useReports()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Laporan Lapangan</h1>
          <p className="text-muted-foreground text-sm">Kelola dan pantau laporan kendala di lapangan.</p>
        </div>
        {!isAdmin && (
          <Button className="gap-2">
            <Plus size={16} />
            Buat Laporan
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Laporan</CardTitle>
          <CardDescription>Semua laporan yang telah diajukan.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" size={28} />
            </div>
          ) : reports?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">Belum ada laporan</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Laporan yang Anda buat atau yang diajukan karyawan akan muncul di sini.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Tanggal</TableHead>
                  {isAdmin && <TableHead>Karyawan</TableHead>}
                  <TableHead>Kategori</TableHead>
                  <TableHead className="max-w-[300px]">Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports?.map((report: any) => (
                  <TableRow key={report.id} className="group">
                    <TableCell className="text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    {isAdmin && <TableCell className="font-medium">{report.userName}</TableCell>}
                    <TableCell>
                      <Badge variant="secondary" className="capitalize font-normal">
                        {report.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-muted-foreground" title={report.description}>{report.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          report.status === 'approved' ? 'default' : 
                          report.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {report.status === 'approved' ? 'Disetujui' : 
                         report.status === 'pending' ? 'Menunggu' : 
                         report.status === 'need_revision' ? 'Revisi' : 'Ditolak'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
