import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronRight, Loader2, Paperclip } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/datatable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePermits } from '@/hooks/use-permits'
import type { Permit, PermitStatus } from '@/services/permit.service'

const statusOptions: { value: PermitStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
]

function statusBadge(s: PermitStatus) {
  if (s === 'approved') return <Badge variant="default">Disetujui</Badge>
  if (s === 'pending') return <Badge variant="secondary">Menunggu</Badge>
  return <Badge variant="destructive">Ditolak</Badge>
}

function safeHttpUrl(u?: string | null): string | undefined {
  if (!u) return undefined
  try {
    const parsed = new URL(u, window.location.origin)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : undefined
  } catch {
    return undefined
  }
}

function formatRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const e = new Date(end).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  return s === e ? s : `${s} – ${e}`
}

export default function PermitsPage() {
  const [status, setStatus] = useState<PermitStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const limit = 20
  const { permits, meta, isLoading, validate, isValidating } = usePermits({ status, page, limit })

  const [detail, setDetail] = useState<Permit | null>(null)
  const [notes, setNotes] = useState('')

  const openDetail = (p: Permit) => {
    setDetail(p)
    setNotes(p.notes ?? '')
  }

  const closeDetail = () => {
    setDetail(null)
    setNotes('')
  }

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!detail) return
    try {
      await validate({ id: detail.id, data: { status: action, notes: notes.trim() || undefined } })
      toast.success(action === 'approved' ? 'Pengajuan disetujui' : 'Pengajuan ditolak')
      closeDetail()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memvalidasi pengajuan')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox Pengajuan</h1>
          <p className="text-muted-foreground text-sm">
            Validasi pengajuan cuti, sakit, izin, dan dinas dari karyawan.
          </p>
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as PermitStatus | 'all')}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          <DataTable<Permit>
            data={permits}
            loading={isLoading}
            column={[
              'Nama Karyawan',
              'Departemen',
              'Tipe',
              'Tanggal',
              'Status',
              { label: '', width: '60px' },
            ]}
            field={[
              (p) => <span className="font-medium">{p.user?.name ?? '—'}</span>,
              (p) => <span className="text-muted-foreground">{p.user?.department ?? '—'}</span>,
              (p) => (
                <Badge variant="secondary" className="capitalize font-normal">
                  {p.type}
                </Badge>
              ),
              (p) => (
                <span className="text-muted-foreground">
                  {formatRange(p.startDate, p.endDate)}
                </span>
              ),
              (p) => statusBadge(p.status),
              () => (
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight size={16} />
                </Button>
              ),
            ]}
            rowKey={(p) => p.id}
            onRowClick={openDetail}
            pagination={{
              page: meta?.page ?? page,
              totalPages: meta?.totalPages ?? 1,
              total: meta?.total ?? 0,
              limit: meta?.limit ?? limit,
              onPageChange: setPage,
            }}
            empty="Belum ada pengajuan untuk filter ini"
          />
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && closeDetail()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan</DialogTitle>
            <DialogDescription>
              Tinjau detail pengajuan dan tentukan keputusan.
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Karyawan</p>
                  <p className="font-medium">{detail.user?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Departemen</p>
                  <p className="font-medium">{detail.user?.department ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Tipe</p>
                  <p className="font-medium capitalize">{detail.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <div className="mt-1">{statusBadge(detail.status)}</div>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Tanggal</p>
                  <p className="font-medium">{formatRange(detail.startDate, detail.endDate)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Deskripsi</p>
                  <p className="text-foreground whitespace-pre-line">{detail.description || '—'}</p>
                </div>
                {(() => {
                  const safeAttachment = safeHttpUrl(detail.attachmentUrl)
                  if (!safeAttachment) return null
                  return (
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">Lampiran</p>
                      <a
                        href={safeAttachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                      >
                        <Paperclip size={14} />
                        Lihat lampiran
                      </a>
                    </div>
                  )
                })()}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="permit-notes">Catatan (opsional)</Label>
                <Textarea
                  id="permit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan untuk karyawan…"
                  rows={3}
                  disabled={detail.status !== 'pending'}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Tutup
              </Button>
            </DialogClose>
            {detail?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('rejected')}
                  disabled={isValidating}
                >
                  {isValidating && <Loader2 className="animate-spin" size={14} />}
                  Tolak
                </Button>
                <Button onClick={() => handleAction('approved')} disabled={isValidating}>
                  {isValidating && <Loader2 className="animate-spin" size={14} />}
                  Setujui
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
