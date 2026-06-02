import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Building2, Loader2, MapPin, Plus, Trash2, Pencil, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

function locationSummary(o: Office): string {
  if (o.zoneType === 'polygon') {
    return o.polygon && o.polygon.length >= 3 ? `Polygon · ${o.polygon.length} titik` : 'Belum diatur'
  }
  if (o.latitude != null && o.longitude != null && o.radius != null) {
    return `${o.latitude.toFixed(5)}, ${o.longitude.toFixed(5)} · ${o.radius} m`
  }
  return 'Belum diatur'
}

export default function OfficesPage() {
  const {
    offices,
    isLoading,
    createOffice,
    updateOffice,
    removeOffice,
    isCreating,
    isUpdating,
    isRemoving,
  } = useOffices()

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
          zoneType: 'radius',
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

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kantor</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" size={28} />
            </div>
          ) : offices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">Belum ada kantor</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tambahkan kantor pertama untuk memulai.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Tipe Zona</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead className="w-[60px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offices.map((o: Office) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[260px] truncate" title={o.address}>
                      {o.address || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize font-normal">
                        {o.zoneType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {locationSummary(o)}
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
