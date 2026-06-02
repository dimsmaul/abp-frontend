import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Map,
  MapTileLayer,
  MapZoomControl,
  MapMarker,
  MapCircle,
  MapPolygon,
  MapDrawControl,
  MapDrawCircle,
  MapDrawPolygon,
  MapDrawEdit,
  MapDrawDelete,
  MapDrawUndo,
} from '@/components/ui/map'
import { officeService, type ZoneType, type OfficeInput } from '@/services/office.service'

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456] // Jakarta

type RadiusGeom = { latitude: number; longitude: number; radius: number } | null
type PolygonGeom = number[][] | null // [[lng,lat], ...]

export default function OfficeLocationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const officeQuery = useQuery({
    queryKey: ['office', id],
    queryFn: () => officeService.getById(id!),
    enabled: !!id,
  })

  const office = officeQuery.data

  const [zoneType, setZoneType] = useState<ZoneType>('radius')
  const [radius, setRadius] = useState<RadiusGeom>(null)
  const [polygon, setPolygon] = useState<PolygonGeom>(null)

  useEffect(() => {
    if (!office) return
    setZoneType(office.zoneType)
    if (office.latitude != null && office.longitude != null && office.radius != null) {
      setRadius({ latitude: office.latitude, longitude: office.longitude, radius: office.radius })
    }
    if (office.polygon && office.polygon.length >= 3) {
      setPolygon(office.polygon)
    }
  }, [office])

  const mapCenter = useMemo<[number, number]>(() => {
    if (radius) return [radius.latitude, radius.longitude]
    if (polygon && polygon.length) return [polygon[0][1], polygon[0][0]]
    return DEFAULT_CENTER
  }, [radius, polygon])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<OfficeInput>) => officeService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] })
      queryClient.invalidateQueries({ queryKey: ['office', id] })
      toast.success('Lokasi tersimpan')
      navigate('/offices')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan lokasi')
    },
  })

  const handleRadiusLayers = (group: any) => {
    const layers = group?.getLayers?.() ?? []
    const circle = layers.find((l: any) => typeof l.getRadius === 'function')
    if (!circle) {
      setRadius(null)
      return
    }
    const c = circle.getLatLng()
    setRadius({ latitude: c.lat, longitude: c.lng, radius: Math.round(circle.getRadius()) })
  }

  const handlePolygonLayers = (group: any) => {
    const layers = group?.getLayers?.() ?? []
    const poly = layers.find((l: any) => typeof l.getLatLngs === 'function')
    if (!poly) {
      setPolygon(null)
      return
    }
    const raw = poly.getLatLngs()
    const ring: any[] = Array.isArray(raw[0]) ? raw[0] : raw
    const coords: number[][] = ring.map((p: any) => [p.lng, p.lat])
    setPolygon(coords)
  }

  const handleSave = () => {
    if (zoneType === 'radius') {
      if (!radius) {
        toast.error('Gambar titik dan radius pada peta dulu')
        return
      }
      updateMutation.mutate({
        zoneType: 'radius',
        latitude: radius.latitude,
        longitude: radius.longitude,
        radius: radius.radius,
        polygon: null,
      })
    } else {
      if (!polygon || polygon.length < 3) {
        toast.error('Gambar polygon minimal 3 titik')
        return
      }
      updateMutation.mutate({
        zoneType: 'polygon',
        polygon,
        latitude: null,
        longitude: null,
        radius: null,
      })
    }
  }

  if (officeQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    )
  }

  if (!office) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Kantor tidak ditemukan.</p>
        <Link to="/offices">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={16} />
            Kembali
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link to="/offices" className="text-muted-foreground text-xs hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={12} />
            Kembali ke daftar kantor
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{office.name}</h1>
          <p className="text-sm text-muted-foreground">{office.address || 'Tanpa alamat'}</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
          {updateMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          Simpan Lokasi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atur Zona Presensi</CardTitle>
          <CardDescription>
            Pilih tipe zona, lalu gambar di peta. Radius = satu titik + jangkauan meter. Polygon = area
            tertutup minimal 3 titik.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={zoneType} onValueChange={(v) => setZoneType(v as ZoneType)}>
            <TabsList>
              <TabsTrigger value="radius">Radius</TabsTrigger>
              <TabsTrigger value="polygon">Polygon</TabsTrigger>
            </TabsList>

            <TabsContent value="radius" className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Tools: gambar lingkaran lalu edit/hapus jika perlu.{' '}
                {radius ? (
                  <Badge variant="secondary" className="font-normal">
                    {radius.latitude.toFixed(5)}, {radius.longitude.toFixed(5)} · {radius.radius} m
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-normal">
                    Belum digambar
                  </Badge>
                )}
              </div>
              <div className="h-[480px] w-full overflow-hidden rounded-md border">
                <Map center={mapCenter} zoom={15} className="h-full w-full">
                  <MapTileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapZoomControl />
                  {radius && (
                    <>
                      <MapMarker position={[radius.latitude, radius.longitude]} />
                      <MapCircle center={[radius.latitude, radius.longitude]} radius={radius.radius} />
                    </>
                  )}
                  <MapDrawControl onLayersChange={handleRadiusLayers}>
                    <MapDrawCircle />
                    <MapDrawEdit />
                    <MapDrawDelete />
                    <MapDrawUndo />
                  </MapDrawControl>
                </Map>
              </div>
            </TabsContent>

            <TabsContent value="polygon" className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Tools: gambar polygon (klik titik-titik, tutup poligon untuk menyelesaikan).{' '}
                {polygon && polygon.length >= 3 ? (
                  <Badge variant="secondary" className="font-normal">
                    {polygon.length} titik
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-normal">
                    Belum digambar
                  </Badge>
                )}
              </div>
              <div className="h-[480px] w-full overflow-hidden rounded-md border">
                <Map center={mapCenter} zoom={15} className="h-full w-full">
                  <MapTileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapZoomControl />
                  {polygon && polygon.length >= 3 && (
                    <MapPolygon positions={polygon.map((c) => [c[1], c[0]]) as any} />
                  )}
                  <MapDrawControl onLayersChange={handlePolygonLayers}>
                    <MapDrawPolygon />
                    <MapDrawEdit />
                    <MapDrawDelete />
                    <MapDrawUndo />
                  </MapDrawControl>
                </Map>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
