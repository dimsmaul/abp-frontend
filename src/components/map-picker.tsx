import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type RadiusValue = {
  latitude: number
  longitude: number
  radius: number
}

export type MapPickerProps =
  | {
      mode: 'radius'
      value: RadiusValue | null
      onChange: (v: RadiusValue) => void
    }
  | {
      mode: 'polygon'
      value: number[][] | null
      onChange: (v: number[][]) => void
    }

export function MapPicker(props: MapPickerProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center">
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MapPin size={16} />
        </div>
        <p className="text-sm font-medium">Peta interaktif belum aktif</p>
        <p className="text-xs text-muted-foreground">
          Input koordinat manual di bawah. Picker peta akan menyusul.
        </p>
      </div>

      {props.mode === 'radius' ? (
        <RadiusInputs value={props.value} onChange={props.onChange} />
      ) : (
        <PolygonInput value={props.value} onChange={props.onChange} />
      )}
    </div>
  )
}

function RadiusInputs({
  value,
  onChange,
}: {
  value: RadiusValue | null
  onChange: (v: RadiusValue) => void
}) {
  const v: RadiusValue = value ?? { latitude: 0, longitude: 0, radius: 100 }
  const patch = (p: Partial<RadiusValue>) => onChange({ ...v, ...p })

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="mp-lat">Latitude</Label>
        <Input
          id="mp-lat"
          type="number"
          step="any"
          value={Number.isFinite(v.latitude) ? v.latitude : ''}
          onChange={(e) => patch({ latitude: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mp-lng">Longitude</Label>
        <Input
          id="mp-lng"
          type="number"
          step="any"
          value={Number.isFinite(v.longitude) ? v.longitude : ''}
          onChange={(e) => patch({ longitude: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mp-rad">Radius (m)</Label>
        <Input
          id="mp-rad"
          type="number"
          step="any"
          value={Number.isFinite(v.radius) ? v.radius : ''}
          onChange={(e) => patch({ radius: parseFloat(e.target.value) || 0 })}
        />
      </div>
    </div>
  )
}

function PolygonInput({
  value,
  onChange,
}: {
  value: number[][] | null
  onChange: (v: number[][]) => void
}) {
  const text = value ? JSON.stringify(value) : ''
  return (
    <div className="space-y-1.5">
      <Label htmlFor="mp-poly">Polygon (JSON)</Label>
      <Textarea
        id="mp-poly"
        placeholder='[[lng,lat],[lng,lat],[lng,lat],[lng,lat]]'
        value={text}
        onChange={(e) => {
          const raw = e.target.value
          try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) onChange(parsed as number[][])
          } catch {
            // ignore invalid JSON while typing
          }
        }}
        rows={4}
      />
      <p className="text-xs text-muted-foreground">
        Format GeoJSON ring: array of [lng, lat]. Minimal 3 titik.
      </p>
    </div>
  )
}
