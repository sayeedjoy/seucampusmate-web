'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, Github } from 'lucide-react';
import type { TeamMember } from '@/lib/db/schema';
import { toast } from 'sonner';

type Props = {
  initialMembers: TeamMember[];
};

type SortMode =
  | 'displayOrderAsc'
  | 'displayOrderDesc'
  | 'nameAsc'
  | 'nameDesc'
  | 'batchAsc'
  | 'batchDesc';

function isSameOrder(a: TeamMember[], b: TeamMember[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((member, index) => member.id === b[index]?.id);
}

function sortMembersByMode(list: TeamMember[], mode: SortMode): TeamMember[] {
  return [...list].sort((a, b) => {
    if (mode === 'displayOrderAsc') return a.displayOrder - b.displayOrder;
    if (mode === 'displayOrderDesc') return b.displayOrder - a.displayOrder;
    if (mode === 'nameAsc') return a.name.localeCompare(b.name);
    if (mode === 'nameDesc') return b.name.localeCompare(a.name);
    if (mode === 'batchAsc') return a.batch.localeCompare(b.batch);
    return b.batch.localeCompare(a.batch);
  });
}

function SortableRow({
  member,
  onEdit,
  onDelete,
}: {
  member: TeamMember;
  onEdit: (m: TeamMember) => void;
  onDelete: (m: TeamMember) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border bg-background p-3"
    >
      <button
        type="button"
        className="touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full border bg-muted">
        <Image
          src={member.imageUrl}
          alt={member.name}
          fill
          className="object-cover"
          sizes="48px"
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{member.name}</p>
        <p className="text-sm text-muted-foreground truncate">
          {member.role} · {member.batch}
        </p>
        {member.githubUrl ? (
          <a
            href={member.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary inline-flex items-center gap-1 mt-0.5 truncate max-w-full"
          >
            <Github className="size-3 shrink-0" />
            <span className="truncate">{member.githubUrl}</span>
          </a>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onEdit(member)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onDelete(member)}>
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function TeamClient({ initialMembers }: Props) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [sortMode, setSortMode] = useState<SortMode>('displayOrderAsc');

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('admin-team-sort-mode');
    if (
      saved === 'displayOrderAsc' ||
      saved === 'displayOrderDesc' ||
      saved === 'nameAsc' ||
      saved === 'nameDesc' ||
      saved === 'batchAsc' ||
      saved === 'batchDesc'
    ) {
      const restoredMode = saved as SortMode;
      const nextMembers = sortMembersByMode(initialMembers, restoredMode);
      setSortMode(restoredMode);
      setMembers(nextMembers);

      if (restoredMode !== 'displayOrderAsc' && !isSameOrder(initialMembers, nextMembers)) {
        setOrdering(true);
        void persistOrder(nextMembers, 'Failed to apply selected order.').finally(() => {
          setOrdering(false);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('admin-team-sort-mode', sortMode);
  }, [sortMode]);

  const sortedMembers = sortMembersByMode(members, sortMode);
  const isCustomOrderView = sortMode === 'displayOrderAsc';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    role: '',
    batch: '',
    githubUrl: '',
    file: null as File | null,
  });
  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    batch: '',
    githubUrl: '',
    file: null as File | null,
  });
  const [editPreview, setEditPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (createOpen) return;
    setCreateForm({ name: '', role: '', batch: '', githubUrl: '', file: null });
    setCreatePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [createOpen]);

  useEffect(() => {
    if (!editTarget) return;
    setEditForm({
      name: editTarget.name,
      role: editTarget.role,
      batch: editTarget.batch,
      githubUrl: editTarget.githubUrl ?? '',
      file: null,
    });
    setEditPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [editTarget]);

  function onCreateFileChange(f: File | null) {
    setCreateForm((prev) => ({ ...prev, file: f }));
    if (createPreview) URL.revokeObjectURL(createPreview);
    setCreatePreview(f ? URL.createObjectURL(f) : null);
  }

  function onEditFileChange(f: File | null) {
    setEditForm((prev) => ({ ...prev, file: f }));
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditPreview(f ? URL.createObjectURL(f) : null);
  }

  async function persistOrder(nextMembers: TeamMember[], errorMessage: string): Promise<boolean> {
    const res = await fetch('/api/admin/team/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: nextMembers.map((m) => m.id) }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error((data as { error?: string }).error ?? errorMessage);
      return false;
    }
    router.refresh();
    return true;
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = members.findIndex((m) => m.id === active.id);
    const newIndex = members.findIndex((m) => m.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = members;
    const reordered = arrayMove(members, oldIndex, newIndex);
    setMembers(reordered);

    try {
      const ok = await persistOrder(reordered, 'Failed to save team order.');
      if (!ok) {
        setMembers(previous);
      }
    } catch {
      setMembers(previous);
      toast.error('Failed to save team order.');
    }
  }

  async function handleSortModeChange(value: string) {
    const nextMode = value as SortMode;
    if (ordering || nextMode === sortMode) return;
    if (members.length === 0) {
      setSortMode(nextMode);
      return;
    }

    const previousMembers = members;
    const previousMode = sortMode;
    const nextMembers = sortMembersByMode(members, nextMode);

    setSortMode(nextMode);
    setMembers(nextMembers);
    setOrdering(true);
    try {
      const ok = await persistOrder(nextMembers, 'Failed to apply selected order.');
      if (!ok) {
        setSortMode(previousMode);
        setMembers(previousMembers);
        return;
      }
      toast.success('Order saved. The public About page now reflects this order.');
    } catch {
      setSortMode(previousMode);
      setMembers(previousMembers);
      toast.error('Failed to apply selected order.');
    } finally {
      setOrdering(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!createForm.file) {
      toast.error('Image is required.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', createForm.name.trim());
      fd.append('role', createForm.role.trim());
      fd.append('batch', createForm.batch.trim());
      if (createForm.githubUrl.trim()) fd.append('githubUrl', createForm.githubUrl.trim());
      fd.append('image', createForm.file);
      const res = await fetch('/api/admin/team', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'Failed to create team member.');
        return;
      }
      setCreateOpen(false);
      toast.success('Team member created.');
      router.refresh();
    } catch {
      toast.error('Failed to connect to server.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || saving) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', editForm.name.trim());
      fd.append('role', editForm.role.trim());
      fd.append('batch', editForm.batch.trim());
      fd.append('githubUrl', editForm.githubUrl.trim());
      if (editForm.file) fd.append('image', editForm.file);
      const res = await fetch(`/api/admin/team/${editTarget.id}`, { method: 'PATCH', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'Failed to update team member.');
        return;
      }
      setEditTarget(null);
      toast.success('Team member updated.');
      router.refresh();
    } catch {
      toast.error('Failed to connect to server.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/team/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'Failed to delete team member.');
        return;
      }
      setDeleteTarget(null);
      toast.success('Team member deleted.');
      router.refresh();
    } catch {
      toast.error('Failed to connect to server.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            About page team section — drag to reorder
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={sortMode}
            onValueChange={handleSortModeChange}
          >
            <SelectTrigger className="w-[220px]" disabled={ordering}>
              <SelectValue placeholder="Select ordering" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="displayOrderAsc">Order: Custom (Drag)</SelectItem>
              <SelectItem value="displayOrderDesc">Order: Custom (Reverse)</SelectItem>
              <SelectItem value="nameAsc">Order: Name A-Z</SelectItem>
              <SelectItem value="nameDesc">Order: Name Z-A</SelectItem>
              <SelectItem value="batchAsc">Order: Batch A-Z</SelectItem>
              <SelectItem value="batchDesc">Order: Batch Z-A</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add member
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!isCustomOrderView && (
            <p className="text-xs text-muted-foreground">
              Drag and drop is available only in <strong>Custom (Drag)</strong> ordering mode.
            </p>
          )}
          {sortedMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No team members yet.</p>
          ) : (
            <>
              {isCustomOrderView ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={members.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2">
                      {sortedMembers.map((m) => (
                        <SortableRow
                          key={m.id}
                          member={m}
                          onEdit={setEditTarget}
                          onDelete={setDeleteTarget}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-col gap-2">
                  {sortedMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 rounded-md border bg-background p-3"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-full border bg-muted">
                        <Image
                          src={m.imageUrl}
                          alt={m.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{m.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {m.role} · {m.batch}
                        </p>
                        {m.githubUrl ? (
                          <a
                            href={m.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary inline-flex items-center gap-1 mt-0.5 truncate max-w-full"
                          >
                            <Github className="size-3 shrink-0" />
                            <span className="truncate">{m.githubUrl}</span>
                          </a>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditTarget(m)}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setDeleteTarget(m)}>
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add team member</DialogTitle>
            <DialogDescription>Name, role, batch, optional GitHub URL, and image.</DialogDescription>
          </DialogHeader>
          <form id="create-team-form" onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Name</Label>
              <Input
                id="c-name"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-role">Role</Label>
              <Input
                id="c-role"
                value={createForm.role}
                onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-batch">Batch</Label>
              <Input
                id="c-batch"
                value={createForm.batch}
                onChange={(e) => setCreateForm((p) => ({ ...p, batch: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-gh">GitHub URL (optional)</Label>
              <Input
                id="c-gh"
                type="url"
                value={createForm.githubUrl}
                onChange={(e) => setCreateForm((p) => ({ ...p, githubUrl: e.target.value }))}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-img">Image</Label>
              <Input
                id="c-img"
                type="file"
                accept="image/*"
                required
                onChange={(e) => onCreateFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
            {createPreview && (
              <div className="relative mx-auto size-24 overflow-hidden rounded-full border">
                <Image src={createPreview} alt="" fill className="object-cover" unoptimized />
              </div>
            )}
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="create-team-form" disabled={saving}>
              {saving ? 'Saving…' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit team member</DialogTitle>
            <DialogDescription>Leave image empty to keep the current photo.</DialogDescription>
          </DialogHeader>
          <form id="edit-team-form" onSubmit={handleEdit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Name</Label>
              <Input
                id="e-name"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-role">Role</Label>
              <Input
                id="e-role"
                value={editForm.role}
                onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-batch">Batch</Label>
              <Input
                id="e-batch"
                value={editForm.batch}
                onChange={(e) => setEditForm((p) => ({ ...p, batch: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-gh">GitHub URL (optional)</Label>
              <Input
                id="e-gh"
                type="url"
                value={editForm.githubUrl}
                onChange={(e) => setEditForm((p) => ({ ...p, githubUrl: e.target.value }))}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-img">New image (optional)</Label>
              <Input
                id="e-img"
                type="file"
                accept="image/*"
                onChange={(e) => onEditFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex gap-4 items-center">
              {editTarget && (
                <div className="relative size-16 overflow-hidden rounded-full border shrink-0">
                  <Image
                    src={editPreview ?? editTarget.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="edit-team-form" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete team member?</DialogTitle>
            <DialogDescription>
              This removes <strong>{deleteTarget?.name}</strong> from the About page and deletes the image from
              Cloudinary.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

