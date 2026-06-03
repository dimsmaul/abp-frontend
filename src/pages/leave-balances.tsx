import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Pencil } from 'lucide-react'
import { useLeaveBalances } from '@/hooks/use-leave-balances'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { DataTable } from '@/components/datatable'
import type { LeaveBalance } from '@/services/leave-balance.service'

// Surface previous + current + next year so admin can backfill / pre-seed
// without freezing the page on Jan 1.
function buildYearOptions(): number[] {
  const current = new Date().getFullYear()
  return [current + 1, current, current - 1, current - 2]
}

type EditForm = {
  totalDays: string
  usedDays: string
  notes: string
}

export default function LeaveBalancesPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [page, setPage] = useState(1)
  const limit = 20
  const { balances, meta, isLoading, updateBalance, isUpdating } = useLeaveBalances({
    page,
    limit,
    year,
  })

  const [editing, setEditing] = useState<LeaveBalance | null>(null)
  const [form, setForm] = useState<EditForm>({ totalDays: '12', usedDays: '0', notes: '' })

  const openEdit = (row: LeaveBalance) => {
    setEditing(row)
    setForm({
      totalDays: String(row.totalDays ?? 12),
      usedDays: String(row.usedDays ?? 0),
      notes: row.notes ?? '',
    })
  }

  const closeEdit = () => {
    setEditing(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return

    const total = Number(form.totalDays)
    const used = Number(form.usedDays)
    if (Number.isNaN(total) || total < 0) {
      toast.error('Total hari tidak valid')
      return
    }
    if (Number.isNaN(used) || used < 0) {
      toast.error('Hari terpakai tidak valid')
      return
    }
    if (used > total) {
      toast.error('Terpakai tidak boleh melebihi total')
      return
    }

    try {
      await updateBalance({
        userId: editing.userId,
        data: {
          year,
          totalDays: total,
          usedDays: used,
          notes: form.notes.trim() || undefined,
        },
      })
      toast.success('Saldo cuti diperbarui')
      closeEdit()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Gagal menyimpan saldo')
    }
  }

  const yearOptions = buildYearOptions()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Saldo Cuti</h1>
          <p className="text-muted-foreground text-sm">
            Atur jatah cuti tahunan karyawan dan pantau penggunaan.
          </p>
        </div>
        <Select
          value={String(year)}
          onValueChange={(v) => {
            setYear(Number(v))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent>
          <DataTable<LeaveBalance>
            data={balances}
            loading={isLoading}
            column={[
              'Nama',
              'Departemen',
              'Total',
              'Terpakai',
              'Sisa',
              { label: '', width: '60px', className: 'text-right' },
            ]}
            field={[
              (b) => <span className="font-medium">{b.user?.name ?? '—'}</span>,
              (b) => <span className="text-muted-foreground">{b.user?.department ?? '—'}</span>,
              (b) => <span>{b.totalDays}</span>,
              (b) => <span>{b.usedDays}</span>,
              (b) => (
                <span
                  className={
                    b.remainingDays <= 0
                      ? 'text-destructive font-medium'
                      : b.remainingDays <= 3
                        ? 'text-amber-600 font-medium'
                        : 'text-emerald-600 font-medium'
                  }
                >
                  {b.remainingDays}
                </span>
              ),
              (b) => (
                <div className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                    <Pencil size={14} />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              ),
            ]}
            rowKey={(b) => b.userId}
            pagination={{
              page: meta?.page ?? page,
              totalPages: meta?.totalPages ?? 1,
              total: meta?.total ?? 0,
              limit: meta?.limit ?? limit,
              onPageChange: setPage,
            }}
            empty="Belum ada data saldo cuti"
          />
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Saldo Cuti</DialogTitle>
            <DialogDescription>
              {editing?.user?.name ?? '—'} · Tahun {year}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lb-total">Total Hari</Label>
                <Input
                  id="lb-total"
                  type="number"
                  min={0}
                  step="0.5"
                  value={form.totalDays}
                  onChange={(e) => setForm({ ...form, totalDays: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lb-used">Terpakai</Label>
                <Input
                  id="lb-used"
                  type="number"
                  min={0}
                  step="0.5"
                  value={form.usedDays}
                  onChange={(e) => setForm({ ...form, usedDays: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lb-notes">Catatan</Label>
              <Textarea
                id="lb-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Misal: penyesuaian akhir tahun, carry-over, dll."
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="animate-spin" size={14} />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
