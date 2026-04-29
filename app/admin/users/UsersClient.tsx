'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Shield, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AdminSummary = {
  id: number;
  name: string | null;
  email: string;
  createdAt: Date;
  isSuperAdmin: boolean;
};

type Props = {
  admins: AdminSummary[];
  currentAdminId: number | null;
};

export default function UsersClient({ admins, currentAdminId }: Props) {
  const router = useRouter();
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<number | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (creatingAdmin) return;

    setCreatingAdmin(true);
    setAdminError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? 'Failed to create admin.';
        setAdminError(message);
        toast.error(message);
        return;
      }
      setForm({ name: '', email: '', password: '' });
      toast.success('Admin created.');
      router.refresh();
    } catch {
      setAdminError('Failed to connect to server.');
      toast.error('Failed to connect to server.');
    } finally {
      setCreatingAdmin(false);
    }
  }

  async function handleDeleteAdmin(id: number) {
    if (deletingAdminId) return;
    setDeletingAdminId(id);
    setAdminError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? 'Failed to delete admin.';
        setAdminError(message);
        toast.error(message);
        return;
      }
      toast.success('Admin deleted.');
      router.refresh();
    } catch {
      setAdminError('Failed to connect to server.');
      toast.error('Failed to connect to server.');
    } finally {
      setDeletingAdminId(null);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Admin account management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4" />
            Admin Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Name</Label>
              <Input
                id="admin-name"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Admin Name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={creatingAdmin} className="w-full">
                <UserPlus className="size-4" />
                {creatingAdmin ? 'Creating...' : 'Add Admin'}
              </Button>
            </div>
          </form>

          {adminError && <p className="text-sm text-destructive">{adminError}</p>}

          <div className="space-y-0 divide-y rounded-md border">
            {admins.map(admin => {
              const canDelete = !admin.isSuperAdmin && admin.id !== currentAdminId;
              return (
                <div key={admin.id} className="flex items-center justify-between p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{admin.name || admin.email}</p>
                      {admin.isSuperAdmin && <Badge variant="secondary">Superadmin</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {admin.email} · Added {format(new Date(admin.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canDelete || deletingAdminId === admin.id}
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="ml-3"
                  >
                    {deletingAdminId === admin.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
