import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MapPin, Plus, Trash2, Pencil, MoreHorizontal, Check, Minus, Loader2, Map as MapIcon, Rows } from 'lucide-react'
import {
  Map,
  MapPolygon,
  MapTileLayer,
  MapMarker,
  MapPopup,
  MapZoomControl,
} from '@/components/ui/map'
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

type FormState = {
  name: string
  address: string
  workStartTime: string
  workEndTime: string
  lateThresholdMinutes: number
}

const emptyForm: FormState = {
  name: '',
  address: '',
  workStartTime: '08:00',
  workEndTime: '17:00',
  lateThresholdMinutes: 15,
}

// Backend stores time as 'HH:MM:SS'; <input type="time"> wants 'HH:MM'.
function toTimeInput(v?: string | null, fallback = '08:00') {
  if (!v) return fallback
  return v.length >= 5 ? v.slice(0, 5) : v
}

function isLocationSet(o: Office): boolean {
  return !!(o.polygon && o.polygon.length >= 3)
}

// Backend polygons are GeoJSON-style [[lng, lat], ...]; Leaflet wants
// [[lat, lng], ...]. Swap once per render to keep MapPolygon happy.
function toLeafletRing(p: number[][] | null | undefined): [number, number][] {
  if (!p) return []
  return p.map(([lng, lat]) => [lat, lng] as [number, number])
}

function polygonCentroid(p: number[][]): [number, number] | null {
  if (!p || p.length < 3) return null
  let lat = 0
  let lng = 0
  for (const [pLng, pLat] of p) {
    lat += pLat
    lng += pLng
  }
  return [lat / p.length, lng / p.length]
}

export default function OfficesPage() {
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'list' | 'map'>('list')
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
    setForm({
      name: o.name,
      address: o.address ?? '',
      workStartTime: toTimeInput(o.workStartTime, '08:00'),
      workEndTime: toTimeInput(o.workEndTime, '17:00'),
      lateThresholdMinutes:
        typeof o.lateThresholdMinutes === 'number' ? o.lateThresholdMinutes : 15,
    })
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Nama kantor wajib diisi')
      return
    }
    try {
      const schedule = {
        workStartTime: form.workStartTime || null,
        workEndTime: form.workEndTime || null,
        lateThresholdMinutes:
          Number.isFinite(form.lateThresholdMinutes) && form.lateThresholdMinutes >= 0
            ? form.lateThresholdMinutes
            : null,
      }
      if (editing) {
        await updateOffice({
          id: editing.id,
          data: { name: form.name, address: form.address, ...schedule },
        })
        toast.success('Kantor diperbarui')
      } else {
        const payload: OfficeInput = {
          name: form.name,
          address: form.address,
          zoneType: 'polygon',
          ...schedule,
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
        <div className="flex items-center gap-2">
          <div className="bg-muted inline-flex items-center rounded-md p-0.5">
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="gap-1.5"
              onClick={() => setView('list')}
            >
              <Rows size={14} />
              List
            </Button>
            <Button
              variant={view === 'map' ? 'default' : 'ghost'}
              size="sm"
              className="gap-1.5"
              onClick={() => setView('map')}
            >
              <MapIcon size={14} />
              Map
            </Button>
          </div>
          <Button className="gap-2" onClick={openCreate}>
            <Plus size={16} />
            Tambah Kantor
          </Button>
        </div>
      </div>

      {view === 'map' ? (
        <OfficesMapView offices={offices} loading={isLoading} />
      ) : (
      <Card>
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
      )}

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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="office-work-start">Jam Mulai</Label>
                <Input
                  id="office-work-start"
                  type="time"
                  value={form.workStartTime}
                  onChange={(e) =>
                    setForm({ ...form, workStartTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="office-work-end">Jam Selesai</Label>
                <Input
                  id="office-work-end"
                  type="time"
                  value={form.workEndTime}
                  onChange={(e) =>
                    setForm({ ...form, workEndTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="office-late-threshold">
                Toleransi Terlambat (menit)
              </Label>
              <Input
                id="office-late-threshold"
                type="number"
                min={0}
                max={240}
                value={form.lateThresholdMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lateThresholdMinutes: e.target.value === ''
                      ? 0
                      : Number(e.target.value),
                  })
                }
              />
              <p className="text-muted-foreground text-xs">
                Check-in lewat ambang ini ditandai sebagai terlambat.
              </p>
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

// ── Office map overview ─────────────────────────────────────────────
// Renders every office's geofence polygon on a single Leaflet map. The
// default tile layer in @/components/ui/map is already CartoDB Positron
// (light gray + soft blue water — matches the Google-Maps-style look
// requested), so this view just needs the polygons + a centroid marker
// per office.
function OfficesMapView({
  offices,
  loading,
}: {
  offices: Office[]
  loading: boolean
}) {
  const eligible = useMemo(
    () => offices.filter((o) => isLocationSet(o)),
    [offices],
  )

  const center = useMemo<[number, number]>(() => {
    if (eligible.length === 0) return [-6.2088, 106.8456] // Jakarta default
    // Average of all polygon centroids → keeps the camera reasonable when
    // offices span multiple cities.
    let lat = 0
    let lng = 0
    let n = 0
    for (const o of eligible) {
      const c = polygonCentroid(o.polygon!)
      if (!c) continue
      lat += c[0]
      lng += c[1]
      n += 1
    }
    return n > 0 ? [lat / n, lng / n] : [-6.2088, 106.8456]
  }, [eligible])

  return (
    <Card>
      <CardContent className="p-0">
        <div className="h-[560px] overflow-hidden rounded-md">
          <Map center={center} zoom={eligible.length > 0 ? 12 : 5} className="h-full">
            <MapTileLayer name="Light" />
            <MapZoomControl />
            {eligible.map((o) => {
              const ring = toLeafletRing(o.polygon)
              const c = polygonCentroid(o.polygon!)
              return (
                <span key={o.id}>
                  <MapPolygon
                    positions={ring}
                    pathOptions={{ color: '#2563eb', weight: 2, fillOpacity: 0.15 }}
                  />
                  {c && (
                    <MapMarker position={c}>
                      <MapPopup>
                        <div className="space-y-1">
                          <div className="font-semibold">{o.name}</div>
                          {o.address && (
                            <div className="text-muted-foreground text-xs">{o.address}</div>
                          )}
                          <Link
                            to={`/offices/${o.id}/location`}
                            className="text-xs underline"
                          >
                            Edit area
                          </Link>
                        </div>
                      </MapPopup>
                    </MapMarker>
                  )}
                </span>
              )
            })}
          </Map>
        </div>
        {loading && (
          <div className="text-muted-foreground flex items-center gap-2 p-3 text-xs">
            <Loader2 className="animate-spin" size={14} />
            Memuat kantor…
          </div>
        )}
        {!loading && eligible.length === 0 && (
          <div className="text-muted-foreground p-6 text-center text-sm">
            Belum ada kantor dengan area yang ter-set.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
