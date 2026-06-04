import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Calendar,
  ChevronRight,
  Loader2,
  Paperclip,
} from 'lucide-react'
import { useSession } from '@/lib/auth-client'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import type {
  Permit,
  PermitCategory,
  PermitStatus,
} from '@/services/permit.service'

const statusOptions: { value: PermitStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
]

const categoryTabs: { value: PermitCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'leave', label: 'Cuti' },
  { value: 'sick', label: 'Sakit' },
  { value: 'permit', label: 'Izin' },
  { value: 'overtime', label: 'Lembur' },
  { value: 'reimburse', label: 'Reimburse' },
  { value: 'loan', label: 'Pinjaman' },
]

const categoryLabels: Record<string, string> = {
  leave: 'Cuti',
  sick: 'Sakit',
  permit: 'Izin',
  overtime: 'Lembur',
  reimburse: 'Reimburse',
  loan: 'Pinjaman',
  // Legacy type strings still present in old rows.
  cuti: 'Cuti',
  sakit: 'Sakit',
  izin: 'Izin',
  dinas: 'Dinas',
}

function categoryOf(p: Permit): string {
  return (p.category ?? p.type ?? '').toString()
}

function statusBadge(s: PermitStatus) {
  if (s === 'approved') return <Badge variant="default">Disetujui</Badge>
  if (s === 'pending') return <Badge variant="secondary">Menunggu</Badge>
  return <Badge variant="destructive">Ditolak</Badge>
}

function categoryBadge(p: Permit) {
  const cat = categoryOf(p)
  const label = categoryLabels[cat] ?? cat
  return (
    <Badge variant="secondary" className="capitalize font-normal">
      {label}
    </Badge>
  )
}

function safeHttpUrl(u?: string | null): string | undefined {
  if (!u) return undefined
  try {
    const parsed = new URL(u, window.location.origin)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? parsed.toString()
      : undefined
  } catch {
    return undefined
  }
}

function formatRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const e = new Date(end).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  return s === e ? s : `${s} – ${e}`
}

function formatRupiah(n?: number | null) {
  if (n == null) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(n))
}

// Category-specific "amount" column rendered next to date range.
function categoryDetail(p: Permit): React.ReactNode {
  const cat = categoryOf(p)
  if (cat === 'leave') {
    return p.daysUsed != null ? (
      <span className="text-muted-foreground text-sm">{p.daysUsed} hari</span>
    ) : (
      <span className="text-muted-foreground text-sm">—</span>
    )
  }
  if (cat === 'overtime') {
    return p.overtimeHours != null ? (
      <span className="text-muted-foreground text-sm">{p.overtimeHours} jam</span>
    ) : (
      <span className="text-muted-foreground text-sm">—</span>
    )
  }
  if (cat === 'reimburse') {
    return (
      <span className="text-muted-foreground text-sm">
        {formatRupiah(p.reimburseAmount)}
      </span>
    )
  }
  if (cat === 'loan') {
    return (
      <span className="text-muted-foreground text-sm">
        {formatRupiah(p.loanAmount)}
        {p.loanTenorMonths ? ` · ${p.loanTenorMonths} bln` : ''}
      </span>
    )
  }
  return <span className="text-muted-foreground text-sm">—</span>
}

export default function PermitsPage() {
  const [status, setStatus] = useState<PermitStatus | 'all'>('all')
  const [category, setCategory] = useState<PermitCategory | 'all'>('all')
  const [page, setPage] = useState(1)
  const limit = 20
  const { permits, meta, isLoading, validate, isValidating } = usePermits({
    status,
    category,
    page,
    limit,
  })
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'admin'

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
      await validate({
        id: detail.id,
        data: { status: action, notes: notes.trim() || undefined },
      })
      toast.success(
        action === 'approved' ? 'Pengajuan disetujui' : 'Pengajuan ditolak',
      )
      closeDetail()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Gagal memvalidasi pengajuan',
      )
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Persetujuan</h1>
          <p className="text-muted-foreground text-sm">
            Validasi pengajuan cuti, sakit, izin, lembur, reimburse, dan pinjaman.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/leave-balances"
              className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Calendar size={12} />
              Saldo Cuti
            </Link>
          )}
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as PermitStatus | 'all')
              setPage(1)
            }}
          >
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
      </div>

      <Tabs
        value={category}
        onValueChange={(v) => {
          setCategory(v as PermitCategory | 'all')
          setPage(1)
        }}
      >
        <TabsList>
          {categoryTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent>
          <DataTable<Permit>
            data={permits}
            loading={isLoading}
            column={[
              'Nama Karyawan',
              'Departemen',
              'Kategori',
              'Tanggal',
              'Detail',
              'Status',
              { label: '', width: '60px' },
            ]}
            field={[
              (p) => <span className="font-medium">{p.user?.name ?? '—'}</span>,
              (p) => (
                <span className="text-muted-foreground">
                  {p.user?.department ?? '—'}
                </span>
              ),
              (p) => categoryBadge(p),
              (p) => (
                <span className="text-muted-foreground">
                  {formatRange(p.startDate, p.endDate)}
                </span>
              ),
              (p) => categoryDetail(p),
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
                  <p className="text-muted-foreground text-xs">Kategori</p>
                  <div className="mt-1">{categoryBadge(detail)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <div className="mt-1">{statusBadge(detail.status)}</div>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Tanggal</p>
                  <p className="font-medium">
                    {formatRange(detail.startDate, detail.endDate)}
                  </p>
                </div>

                {/* Category-specific quantitative fields */}
                {categoryOf(detail) === 'leave' && detail.daysUsed != null && (
                  <div>
                    <p className="text-muted-foreground text-xs">Hari</p>
                    <p className="font-medium">{detail.daysUsed}</p>
                  </div>
                )}
                {categoryOf(detail) === 'overtime' &&
                  detail.overtimeHours != null && (
                    <div>
                      <p className="text-muted-foreground text-xs">Jam Lembur</p>
                      <p className="font-medium">{detail.overtimeHours}</p>
                    </div>
                  )}
                {categoryOf(detail) === 'reimburse' && (
                  <div>
                    <p className="text-muted-foreground text-xs">Nominal</p>
                    <p className="font-medium">
                      {formatRupiah(detail.reimburseAmount)}
                    </p>
                  </div>
                )}
                {categoryOf(detail) === 'loan' && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs">Nominal</p>
                      <p className="font-medium">
                        {formatRupiah(detail.loanAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Tenor</p>
                      <p className="font-medium">
                        {detail.loanTenorMonths != null
                          ? `${detail.loanTenorMonths} bulan`
                          : '—'}
                      </p>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Deskripsi</p>
                  <p className="text-foreground whitespace-pre-line">
                    {detail.description || '—'}
                  </p>
                </div>
                {(() => {
                  const safeAttachment =
                    safeHttpUrl(detail.attachmentUrl) ??
                    safeHttpUrl(detail.reimburseReceiptUrl)
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
                  {isValidating && (
                    <Loader2 className="animate-spin" size={14} />
                  )}
                  Tolak
                </Button>
                <Button
                  onClick={() => handleAction('approved')}
                  disabled={isValidating}
                >
                  {isValidating && (
                    <Loader2 className="animate-spin" size={14} />
                  )}
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
