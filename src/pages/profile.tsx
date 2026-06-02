import { useSession } from '@/lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProfilePage() {
  const { data: session } = useSession()
  const user = session?.user as any

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil Saya</h1>
        <p className="text-sm text-muted-foreground">Informasi akun yang sedang masuk.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user?.name ?? '—'}</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Role">
            <Badge variant="secondary" className="capitalize font-normal">
              {user?.role ?? '—'}
            </Badge>
          </Row>
          <Row label="Departemen">{user?.department ?? '—'}</Row>
          <Row label="User ID" mono>
            {user?.id ?? '—'}
          </Row>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono text-xs' : ''}>{children}</span>
    </div>
  )
}
