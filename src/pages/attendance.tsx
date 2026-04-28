import { useAttendance } from '@/hooks/use-attendance'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Camera, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

export default function AttendancePage() {
  const { history, isLoading, isProcessing, handleAction } = useAttendance()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Presensi</h1>
        <p className="text-muted-foreground text-sm">Lakukan check-in atau check-out dari lokasi kerja Anda.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aksi Presensi</CardTitle>
            <CardDescription>Pastikan GPS aktif dan berikan izin kamera.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button 
              className="flex-1 h-28 flex-col gap-2 text-base" 
              onClick={() => handleAction('check_in')}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <ArrowDownLeft size={22} />
              )}
              Check In
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-28 flex-col gap-2 text-base"
              onClick={() => handleAction('check_out')}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <ArrowUpRight size={22} />
              )}
              Check Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Terakhir</CardTitle>
            <CardDescription>Aktivitas presensi terakhir Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-muted-foreground" size={24} />
              </div>
            ) : history?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Belum ada riwayat hari ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history?.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        {item.type === 'check_in' ? <Camera size={14} /> : <MapPin size={14} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{item.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.serverTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={item.isWithinZone ? 'default' : 'destructive'}>
                      {item.isWithinZone ? 'Dalam Zona' : 'Luar Zona'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
