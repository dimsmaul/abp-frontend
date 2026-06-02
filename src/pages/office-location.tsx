import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save, Map as MapIcon, Satellite } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Map,
  MapTileLayer,
  MapZoomControl,
  MapPolygon,
  MapDrawControl,
  MapDrawPolygon,
  MapDrawEdit,
  MapDrawDelete,
  MapDrawUndo,
} from '@/components/ui/map'
import { officeService, type OfficeInput } from '@/services/office.service'

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456] // Jakarta

type PolygonGeom = number[][] | null // [[lng,lat], ...]
type TileKind = 'map' | 'satellite'

const CARTO_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

const TILE_URL = {
  mapLight: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  mapDark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
}

function useResolvedDark(): boolean {
  const { theme } = useTheme()
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])
  return theme === 'dark' || (theme === 'system' && systemDark)
}

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

  const [polygon, setPolygon] = useState<PolygonGeom>(null)
  const [tile, setTile] = useState<TileKind>('map')
  const isDark = useResolvedDark()

  useEffect(() => {
    if (!office) return
    if (office.polygon && office.polygon.length >= 3) {
      setPolygon(office.polygon)
    }
  }, [office])

  const mapCenter = useMemo<[number, number]>(() => {
    if (polygon && polygon.length) return [polygon[0][1], polygon[0][0]]
    return DEFAULT_CENTER
  }, [polygon])

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

  const handleLayers = (group: any) => {
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
    if (!polygon || polygon.length < 3) {
      toast.error('Gambar polygon minimal 3 titik di peta dulu')
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

  const tileUrl =
    tile === 'satellite' ? TILE_URL.satellite : isDark ? TILE_URL.mapDark : TILE_URL.mapLight
  const tileAttr = tile === 'satellite' ? 'Tiles &copy; Esri' : CARTO_ATTR
  const tileKey = `${tile}-${isDark ? 'dark' : 'light'}`

  // Polygon style decoupled from primary token.
  // - Satellite: always WHITE (colorful imagery -> white contrasts best).
  // - Map tile: follows tile darkness; dark tile -> white polygon; light tile -> dark polygon.
  const polygonStyle =
    tile === 'satellite'
      ? { color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.25, weight: 2 }
      : isDark
        ? { color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.25, weight: 2 }
        : { color: '#0a0a0a', fillColor: '#0a0a0a', fillOpacity: 0.25, weight: 2 }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/offices"
            className="text-muted-foreground text-xs hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft size={12} />
            Kembali ke daftar kantor
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{office.name}</h1>
          <p className="text-sm text-muted-foreground">{office.address || 'Tanpa alamat'}</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
          {updateMutation.isPending ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Save size={14} />
          )}
          Simpan Lokasi
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Atur Zona Presensi (Polygon)</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border p-0.5">
              <Button
                size="sm"
                variant={tile === 'map' ? 'secondary' : 'ghost'}
                className="h-7 gap-1.5 px-2.5"
                onClick={() => setTile('map')}
              >
                <MapIcon size={13} /> Map
              </Button>
              <Button
                size="sm"
                variant={tile === 'satellite' ? 'secondary' : 'ghost'}
                className="h-7 gap-1.5 px-2.5"
                onClick={() => setTile('satellite')}
              >
                <Satellite size={13} /> Satelit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-[560px] w-full overflow-hidden rounded-md border">
            <Map center={mapCenter} zoom={15} className="h-full w-full">
              <MapTileLayer key={tileKey} url={tileUrl} attribution={tileAttr} />
              <MapZoomControl />
              {polygon && polygon.length >= 3 && (
                <MapPolygon
                  positions={polygon.map((c) => [c[1], c[0]]) as any}
                  pathOptions={polygonStyle}
                />
              )}
              <MapDrawControl onLayersChange={handleLayers}>
                <MapDrawPolygon shapeOptions={polygonStyle} />
                <MapDrawEdit />
                <MapDrawDelete />
                <MapDrawUndo />
              </MapDrawControl>
            </Map>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
