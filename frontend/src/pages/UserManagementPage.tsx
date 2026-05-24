import { useEffect, useState } from 'react';
import { userApi } from '@/api/userApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SubmitButton } from '@/components/common/SubmitButton';
import type { User } from '@/types/user';

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', citizenshipNumber: '', role: 'MALPOT_OFFICER', district: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      setUsers(res.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      await userApi.updateStatus(user.id, !user.isActive);
      loadUsers();
    } catch {
      /* empty */
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await userApi.create(form);
      setDialogOpen(false);
      setForm({ fullName: '', email: '', password: '', phone: '', citizenshipNumber: '', role: 'MALPOT_OFFICER', district: '' });
      loadUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    MALPOT_OFFICER: 'Malpot Officer',
    CITIZEN: 'Citizen',
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              + Create User
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                )}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('fullName', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('email', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('password', e.target.value)} required minLength={6} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('phone', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Citizenship No.</Label>
                    <Input value={form.citizenshipNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('citizenshipNumber', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={form.role} onValueChange={(v: string | null) => v && updateField('role', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALPOT_OFFICER">Malpot Officer</SelectItem>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        <SelectItem value="CITIZEN">Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input value={form.district} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('district', e.target.value)} />
                  </div>
                </div>
                <SubmitButton loading={creating}>
                  {creating ? 'Creating...' : 'Create User'}
                </SubmitButton>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{roleLabels[u.role] || u.role}</TableCell>
                  <TableCell>{u.district || '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(u)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
