import { useAttendance } from '@/hooks/use-attendance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, MapPin, ExternalLink } from 'lucide-react'

export default function AttendanceListPage() {
  const { webHistory, isWebLoading } = useAttendance()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monitoring Presensi</h1>
        <p className="text-muted-foreground text-sm">Pantau kehadiran seluruh karyawan secara real-time.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Kehadiran</CardTitle>
          <CardDescription>Riwayat presensi seluruh karyawan.</CardDescription>
        </CardHeader>
        <CardContent>
          {isWebLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" size={28} />
            </div>
          ) : webHistory?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">Belum ada data presensi</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Data presensi karyawan akan muncul di sini.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Waktu</TableHead>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status Zona</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webHistory?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(item.serverTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell className="font-medium">{item.userName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize font-normal">
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground" title={item.locationName}>
                      {item.locationName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isWithinZone ? 'default' : 'destructive'}>
                        {item.isWithinZone ? 'Dalam Zona' : 'Luar Zona'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.photoUrl} target="_blank" rel="noreferrer" className="gap-1.5">
                          <ExternalLink size={14} />
                          Foto
                        </a>
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
