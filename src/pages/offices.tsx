import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MapPin, Plus, Trash2, Pencil, MoreHorizontal, Check, Minus, Loader2 } from 'lucide-react'
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
import { DataTable } from '@/components/datatable'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useOffices } from '@/hooks/use-offices'
import type { Office, OfficeInput } from '@/services/office.service'

type FormState = { name: string; address: string }

const emptyForm: FormState = { name: '', address: '' }

function isLocationSet(o: Office): boolean {
  return !!(o.polygon && o.polygon.length >= 3)
}

export default function OfficesPage() {
  const [page, setPage] = useState(1)
  const limit = 20
  const {
    offices,
    meta,
    isLoading,
    createOffice,
    updateOffice,
    removeOffice,
    isCreating,
    isUpdating,
    isRemoving,
  } = useOffices({ page, limit })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Office | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [deleting, setDeleting] = useState<Office | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (o: Office) => {
    setEditing(o)
    setForm({ name: o.name, address: o.address ?? '' })
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Nama kantor wajib diisi')
      return
    }
    try {
      if (editing) {
        await updateOffice({ id: editing.id, data: { name: form.name, address: form.address } })
        toast.success('Kantor diperbarui')
      } else {
        const payload: OfficeInput = {
          name: form.name,
          address: form.address,
          zoneType: 'polygon',
        }
        await createOffice(payload)
        toast.success('Kantor dibuat. Atur lokasi pada baris kantor.')
      }
      setFormOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan kantor')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await removeOffice(deleting.id)
      toast.success('Kantor dihapus')
      setDeleting(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus kantor')
    }
  }

  const isSaving = isCreating || isUpdating

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manajemen Kantor</h1>
          <p className="text-muted-foreground text-sm">
            Kelola lokasi kantor dan zona presensi karyawan.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus size={16} />
          Tambah Kantor
        </Button>
      </div>

      <Card className="py-0">
        <CardContent>
          <DataTable<Office>
            data={offices}
            loading={isLoading}
            column={['Nama', 'Alamat', 'Status Lokasi', { label: '', width: '60px', className: 'text-right' }]}
            field={[
              (o) => <span className="font-medium">{o.name}</span>,
              (o) => (
                <span className="text-muted-foreground max-w-[260px] truncate block" title={o.address}>
                  {o.address || '—'}
                </span>
              ),
              (o) =>
                isLocationSet(o) ? (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Check size={14} className="text-emerald-500" />
                    Sudah
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Minus size={14} />
                    Belum
                  </span>
                ),
              (o) => (
                <div className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                        <span className="sr-only">Aksi</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link to={`/offices/${o.id}/location`}>
                          <MapPin size={14} />
                          Atur Lokasi
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(o)}>
                        <Pencil size={14} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleting(o)}
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
            rowKey={(o) => o.id}
            pagination={{
              page: meta?.page ?? page,
              totalPages: meta?.totalPages ?? 1,
              total: meta?.total ?? 0,
              limit: meta?.limit ?? limit,
              onPageChange: setPage,
            }}
            empty="Belum ada kantor"
          />
        </CardContent>
      </Card>

      {/* Create / Edit dialog (name + address only) */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Kantor' : 'Tambah Kantor'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Perbarui nama dan alamat kantor. Atur lokasi pada halaman terpisah.'
                : 'Isi nama dan alamat. Lokasi diatur lewat tombol "Atur Lokasi" setelah kantor dibuat.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="office-name">Nama</Label>
              <Input
                id="office-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Kantor Pusat Jakarta"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="office-address">Alamat</Label>
              <Input
                id="office-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Jl. Merdeka No. 1"
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="animate-spin" size={14} />}
                {editing ? 'Simpan Perubahan' : 'Tambah Kantor'}
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
              <MapPin size={16} />
              Hapus Kantor?
            </DialogTitle>
            <DialogDescription>
              Anda akan menghapus <span className="font-medium text-foreground">{deleting?.name}</span>.
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
