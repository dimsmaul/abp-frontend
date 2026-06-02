import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, MoreHorizontal, Pencil, UserPlus } from 'lucide-react'
import { useUsers } from '@/hooks/use-users'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/datatable'

type Role = 'employee' | 'manager' | 'admin'

type AppUser = {
  id: string
  name: string
  email: string
  role: Role
  department?: string | null
  createdAt?: string
}

type FormState = {
  name: string
  email: string
  password: string
  role: Role
  department: string
}

const emptyForm: FormState = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  department: '',
}

const roleOptions: { value: Role; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
]

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const limit = 20
  const { users, meta, isLoading, createUser, updateUser, isCreating, isUpdating } = useUsers({
    page,
    limit,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AppUser | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (u: AppUser) => {
    setEditing(u)
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      department: u.department ?? '',
    })
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Nama wajib diisi')
      return
    }
    if (!editing) {
      if (!form.email.trim()) {
        toast.error('Email wajib diisi')
        return
      }
      if (form.password.length < 8) {
        toast.error('Password minimal 8 karakter')
        return
      }
    }
    try {
      if (editing) {
        await updateUser({
          id: editing.id,
          data: {
            name: form.name,
            role: form.role,
            department: form.department || undefined,
          },
        })
        toast.success('User diperbarui')
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          department: form.department || undefined,
        })
        toast.success('User dibuat')
      }
      setFormOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Gagal menyimpan user')
    }
  }

  const isSaving = isCreating || isUpdating

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground text-sm">
            Kelola akun karyawan dan hak akses mereka.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <UserPlus size={16} />
          Tambah User
        </Button>
      </div>

      <Card>
        <CardContent>
          <DataTable<AppUser>
            data={users}
            loading={isLoading}
            column={[
              'Nama',
              'Email',
              'Departemen',
              'Role',
              { label: '', width: '60px', className: 'text-right' },
            ]}
            field={[
              (u) => <span className="font-medium">{u.name}</span>,
              (u) => <span className="text-muted-foreground">{u.email}</span>,
              (u) => u.department || '—',
              (u) => (
                <Badge variant="secondary" className="capitalize font-normal">
                  {u.role}
                </Badge>
              ),
              (u) => (
                <div className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                        <span className="sr-only">Aksi</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => openEdit(u)}>
                        <Pencil size={14} />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit User' : 'Tambah User'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Perbarui nama, role, atau departemen pengguna. Email dan password tidak dapat diubah.'
                : 'Buat akun karyawan baru. Pengguna login dengan email dan password yang Anda set.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Nama</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Budi Santoso"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="budi@company.com"
                disabled={!!editing}
                required
              />
              {editing && (
                <p className="text-muted-foreground text-xs">Email tidak dapat diubah.</p>
              )}
            </div>

            {!editing && (
              <div className="space-y-1.5">
                <Label htmlFor="user-password">Password</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as Role })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-dept">Departemen</Label>
              <Input
                id="user-dept"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Engineering"
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
                {editing ? 'Simpan Perubahan' : 'Tambah User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
