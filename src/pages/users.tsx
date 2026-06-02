import { useState } from 'react'
import { useUsers } from '@/hooks/use-users'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { DataTable } from '@/components/datatable'

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const limit = 20
  const { users, meta, isLoading } = useUsers({ page, limit })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground text-sm">Kelola akun karyawan dan hak akses mereka.</p>
        </div>
        <Button className="gap-2">
          <UserPlus size={16} />
          Tambah User
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable<any>
            data={users}
            loading={isLoading}
            column={['Nama', 'Email', 'Departemen', 'Role', { label: '', width: '80px' }]}
            field={[
              (u) => <span className="font-medium">{u.name}</span>,
              (u) => <span className="text-muted-foreground">{u.email}</span>,
              (u) => u.department || '—',
              (u) => (
                <Badge variant="secondary" className="capitalize font-normal">
                  {u.role}
                </Badge>
              ),
              () => (
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              ),
            ]}
            rowKey={(u) => u.id}
            pagination={{
              page: meta?.page ?? page,
              totalPages: meta?.totalPages ?? 1,
              total: meta?.total ?? 0,
              limit: meta?.limit ?? limit,
              onPageChange: setPage,
            }}
            empty="Belum ada pengguna"
          />
        </CardContent>
      </Card>
    </div>
  )
}
