'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Key, Plus, Copy, Check, Trash2, PowerOff, Power } from 'lucide-react';
import { format } from 'date-fns';

type ApiKeyRow = {
  id: number;
  name: string;
  keyPrefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  isActive: boolean;
  createdByName: string | null;
};

interface Props {
  keys: ApiKeyRow[];
  isSuperAdmin: boolean;
}

export default function ApiKeysClient({ keys, isSuperAdmin }: Props) {
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ApiKeyRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? 'Failed to create key.');
        return;
      }
      setRevealedKey(data.rawKey);
      setNewKeyName('');
      router.refresh();
    } catch {
      setCreateError('Failed to connect to server.');
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy() {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCloseCreate() {
    setCreateOpen(false);
    setRevealedKey(null);
    setNewKeyName('');
    setCreateError(null);
    setCopied(false);
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/api-keys/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? 'Failed to delete key.');
        return;
      }
      setDeleteTarget(null);
      router.refresh();
    } catch {
      alert('Failed to connect to server.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggle(key: ApiKeyRow) {
    if (togglingId) return;
    setTogglingId(key.id);
    try {
      const res = await fetch(`/api/admin/api-keys/${key.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !key.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? 'Failed to update key.');
        return;
      }
      router.refresh();
    } catch {
      alert('Failed to connect to server.');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage chatbot API keys for the routine endpoint
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create New Key
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="size-4" />
            Active Keys ({keys.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10 px-6">
              No API keys yet. Create one to allow your chatbot to query exam routines.
            </p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-t">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Key Prefix</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Created By</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Created At</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Last Used</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {keys.map((key) => (
                    <tr key={key.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{key.name}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {key.keyPrefix}...
                        </code>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {key.createdByName ?? <span className="italic">Unknown</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {format(new Date(key.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {key.lastUsedAt ? (
                          format(new Date(key.lastUsedAt), 'dd MMM yyyy, hh:mm a')
                        ) : (
                          <span className="italic">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={key.isActive ? 'default' : 'secondary'}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={togglingId === key.id}
                            onClick={() => handleToggle(key)}
                            title={key.isActive ? 'Disable key' : 'Enable key'}
                          >
                            {key.isActive ? (
                              <PowerOff className="size-3.5" />
                            ) : (
                              <Power className="size-3.5" />
                            )}
                            {togglingId === key.id
                              ? 'Updating...'
                              : key.isActive
                              ? 'Disable'
                              : 'Enable'}
                          </Button>
                          {isSuperAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(key)}
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Chatbot Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Your chatbot can query the routine using:
          </p>
          <code className="block text-xs bg-muted px-3 py-2 rounded font-mono">
            GET /api/chatbot/routine?code=CSE123.2
          </code>
          <p className="text-xs text-muted-foreground">
            Pass the key via <code className="bg-muted px-1 rounded">x-api-key</code> header or{' '}
            <code className="bg-muted px-1 rounded">Authorization: Bearer &lt;key&gt;</code>.
            Supports <code className="bg-muted px-1 rounded">?code=</code>,{' '}
            <code className="bg-muted px-1 rounded">?codes=</code> (comma-separated), or{' '}
            <code className="bg-muted px-1 rounded">?search=</code> (title search).
          </p>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) handleCloseCreate(); else setCreateOpen(true); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{revealedKey ? 'Key Created' : 'Create API Key'}</DialogTitle>
            <DialogDescription>
              {revealedKey
                ? 'Copy your key now — it will not be shown again.'
                : 'Give the key a name to identify its purpose (e.g. "Campus Chatbot Prod").'}
            </DialogDescription>
          </DialogHeader>

          {revealedKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={revealedKey}
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copy key">
                  {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <p className="text-xs text-destructive font-medium">
                This is the only time this key will be displayed. Store it securely.
              </p>
            </div>
          ) : (
            <form id="create-key-form" onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Campus Chatbot Prod"
                  required
                  autoFocus
                />
              </div>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
            </form>
          )}

          <DialogFooter>
            {revealedKey ? (
              <Button onClick={handleCloseCreate}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCloseCreate} disabled={creating}>
                  Cancel
                </Button>
                <Button type="submit" form="create-key-form" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Key'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> (
              <code className="text-xs">{deleteTarget?.keyPrefix}...</code>). Any chatbot using this
              key will immediately lose access. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
