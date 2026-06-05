import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  CalendarIcon,
  Loader2,
  Megaphone,
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  Trash2,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/datatable'
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
import { useAnnouncements } from '@/hooks/use-announcements'
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementPriority,
} from '@/services/announcement.service'

type FormState = {
  title: string
  body: string
  priority: AnnouncementPriority
  isPinned: boolean
  expiresAt: string // 'YYYY-MM-DD' or ''
}

const emptyForm: FormState = {
  title: '',
  body: '',
  priority: 'normal',
  isPinned: false,
  expiresAt: '',
}

function priorityBadge(p: AnnouncementPriority) {
  if (p === 'high') return <Badge variant="destructive">Tinggi</Badge>
  if (p === 'low')
    return (
      <Badge variant="secondary" className="font-normal">
        Rendah
      </Badge>
    )
  return <Badge variant="default">Normal</Badge>
}

function formatDate(s: string | null | undefined) {
  if (!s) return '—'
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AnnouncementsPage() {
  const [page, setPage] = useState(1)
  const [priorityFilter, setPriorityFilter] = useState<AnnouncementPriority | 'all'>('all')
  const limit = 20

  const {
    announcements,
    meta,
    isLoading,
    createAnnouncement,
    updateAnnouncement,
    removeAnnouncement,
    isCreating,
    isUpdating,
    isRemoving,
  } = useAnnouncements({
    page,
    limit,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [deleting, setDeleting] = useState<Announcement | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (a: Announcement) => {
    setEditing(a)
    setForm({
      title: a.title,
      body: a.body,
      priority: a.priority,
      isPinned: a.isPinned,
      expiresAt: a.expiresAt ? a.expiresAt.slice(0, 10) : '',
    })
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Judul wajib diisi')
      return
    }
    if (!form.body.trim()) {
      toast.error('Isi pengumuman wajib diisi')
      return
    }

    let expiresIso: string | null = null
    if (form.expiresAt) {
      // Local end of day so date-only inputs don't expire too early.
      const d = new Date(`${form.expiresAt}T23:59:59`)
      if (Number.isNaN(d.getTime())) {
        toast.error('Tanggal kadaluarsa tidak valid')
        return
      }
      expiresIso = d.toISOString()
    }

    const payload: AnnouncementInput = {
      title: form.title.trim(),
      body: form.body.trim(),
      priority: form.priority,
      isPinned: form.isPinned,
      expiresAt: expiresIso,
    }

    try {
      if (editing) {
        await updateAnnouncement({ id: editing.id, data: payload })
        toast.success('Pengumuman diperbarui')
      } else {
        await createAnnouncement(payload)
        toast.success('Pengumuman dibuat')
      }
      setFormOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan pengumuman')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await removeAnnouncement(deleting.id)
      toast.success('Pengumuman dihapus')
      setDeleting(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus pengumuman')
    }
  }

  const isSaving = isCreating || isUpdating

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pengumuman</h1>
          <p className="text-muted-foreground text-sm">
            Kelola pengumuman internal untuk karyawan lapangan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={priorityFilter}
            onValueChange={(v) => {
              setPriorityFilter(v as AnnouncementPriority | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Prioritas</SelectItem>
              <SelectItem value="low">Rendah</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Tinggi</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={openCreate}>
            <Plus size={16} />
            Buat Pengumuman
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <DataTable<Announcement>
            data={announcements}
            loading={isLoading}
            column={[
              'Judul',
              'Prioritas',
              'Pinned',
              'Dipublikasi oleh',
              'Tanggal terbit',
              { label: '', width: '60px', className: 'text-right' },
            ]}
            field={[
              (a) => (
                <span
                  className="font-medium block max-w-[260px] truncate"
                  title={a.title}
                >
                  {a.title}
                </span>
              ),
              (a) => priorityBadge(a.priority),
              (a) =>
                a.isPinned ? (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Pin size={14} className="text-amber-500" />
                    Ya
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">Tidak</span>
                ),
              (a) => (
                <span className="text-muted-foreground">
                  {a.publishedBy?.name ?? '—'}
                </span>
              ),
              (a) => (
                <span className="text-muted-foreground">
                  {formatDate(a.publishedAt)}
                </span>
              ),
              (a) => (
                <div className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                        <span className="sr-only">Aksi</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => openEdit(a)}>
                        <Pencil size={14} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleting(a)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 size={14} />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            ]}
            rowKey={(a) => a.id}
            pagination={{
              page: meta?.page ?? page,
              totalPages: meta?.totalPages ?? 1,
              total: meta?.total ?? 0,
              limit: meta?.limit ?? limit,
              onPageChange: setPage,
            }}
            empty="Belum ada pengumuman"
          />
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Pengumuman' : 'Buat Pengumuman'}
            </DialogTitle>
            <DialogDescription>
              Pengumuman tampil di dashboard mobile karyawan sampai tanggal
              kadaluarsa (jika diisi).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title">Judul</Label>
              <Input
                id="ann-title"
                value={form.title}
                maxLength={200}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Libur Idul Adha"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ann-body">Isi</Label>
              <Textarea
                id="ann-body"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Detail pengumuman…"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Prioritas</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm({ ...form, priority: v as AnnouncementPriority })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Rendah</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ann-expires">Kadaluarsa (opsional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="ann-expires"
                      type="button"
                      variant="outline"
                      className="w-full justify-start font-normal"
                    >
                      <CalendarIcon />
                      {form.expiresAt
                        ? format(new Date(`${form.expiresAt}T00:00:00`), 'PPP')
                        : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        form.expiresAt
                          ? new Date(`${form.expiresAt}T00:00:00`)
                          : undefined
                      }
                      onSelect={(d) =>
                        setForm({
                          ...form,
                          expiresAt: d ? format(d, 'yyyy-MM-dd') : '',
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="ann-pinned"
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              />
              <Label htmlFor="ann-pinned" className="cursor-pointer">
                Sematkan di atas daftar
              </Label>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="animate-spin" size={14} />}
                {editing ? 'Simpan Perubahan' : 'Publikasikan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone size={16} />
              Hapus Pengumuman?
            </DialogTitle>
            <DialogDescription>
              Anda akan menghapus{' '}
              <span className="font-medium text-foreground">{deleting?.title}</span>.
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isRemoving}>
              {isRemoving && <Loader2 className="animate-spin" size={14} />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
