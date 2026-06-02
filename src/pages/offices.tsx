import { useState } from 'react'
import { toast } from 'sonner'
import { Building2, Loader2, MapPin, Plus, Trash2, Pencil } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { MapPicker, type RadiusValue } from '@/components/map-picker'
import { useOffices } from '@/hooks/use-offices'
import type { Office, OfficeInput, ZoneType } from '@/services/office.service'

type FormState = {
  name: string
  address: string
  zoneType: ZoneType
  radius: RadiusValue
  polygon: number[][]
}

const emptyForm: FormState = {
  name: '',
  address: '',
  zoneType: 'radius',
  radius: { latitude: 0, longitude: 0, radius: 100 },
  polygon: [],
}

function officeToForm(o: Office): FormState {
  return {
    name: o.name,
    address: o.address,
    zoneType: o.zoneType,
    radius: {
      latitude: o.latitude ?? 0,
      longitude: o.longitude ?? 0,
      radius: o.radius ?? 100,
    },
    polygon: o.polygon ?? [],
  }
}

function formToPayload(f: FormState): OfficeInput {
  if (f.zoneType === 'radius') {
    return {
      name: f.name,
      address: f.address,
      zoneType: 'radius',
      latitude: f.radius.latitude,
      longitude: f.radius.longitude,
      radius: f.radius.radius,
    }
  }
  return {
    name: f.name,
    address: f.address,
    zoneType: 'polygon',
    polygon: f.polygon,
  }
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
    setForm(officeToForm(o))
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.address.trim()) {
      toast.error('Nama dan alamat wajib diisi')
      return
    }
    if (form.zoneType === 'polygon' && form.polygon.length < 3) {
      toast.error('Polygon harus minimal 3 titik')
      return
    }
    const payload = formToPayload(form)
    try {
      if (editing) {
        await updateOffice({ id: editing.id, data: payload })
        toast.success('Kantor diperbarui')
      } else {
        await createOffice(payload)
        toast.success('Kantor dibuat')
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
          <CardDescription>Semua lokasi kantor yang terdaftar.</CardDescription>
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
                  <TableHead>Detail</TableHead>
                  <TableHead className="w-[140px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offices.map((o: Office) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[260px] truncate" title={o.address}>
                      {o.address}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize font-normal">
                        {o.zoneType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {o.zoneType === 'radius'
                        ? `${o.latitude ?? '—'}, ${o.longitude ?? '—'} · ${o.radius ?? '—'} m`
                        : `${o.polygon?.length ?? 0} titik`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(o)} className="gap-1.5">
                          <Pencil size={14} />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(o)}
                          className="gap-1.5 text-destructive hover:text-destructive"
                        >
                          <Trash2 size={14} />
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Kantor' : 'Tambah Kantor'}</DialogTitle>
            <DialogDescription>
              Tentukan zona presensi: radius dari satu titik atau polygon area.
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

            <div className="space-y-2">
              <Label>Tipe Zona</Label>
              <RadioGroup
                value={form.zoneType}
                onValueChange={(v) => setForm({ ...form, zoneType: v as ZoneType })}
                className="flex gap-6"
              >
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="radius" id="zt-radius" />
                  <span>Radius</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="polygon" id="zt-polygon" />
                  <span>Polygon</span>
                </label>
              </RadioGroup>
            </div>

            {form.zoneType === 'radius' ? (
              <MapPicker
                mode="radius"
                value={form.radius}
                onChange={(v) => setForm({ ...form, radius: v })}
              />
            ) : (
              <MapPicker
                mode="polygon"
                value={form.polygon}
                onChange={(v) => setForm({ ...form, polygon: v })}
              />
            )}

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
