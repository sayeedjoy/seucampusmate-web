'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CalendarDays, CalendarIcon, Globe, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Hackathon } from '@/lib/db/schema';
import { isValidEventLink } from '@/lib/hackathons/validation';
import { cn } from '@/lib/utils';

type Props = {
  initialHackathons: Hackathon[];
};

type FormState = {
  name: string;
  host: string;
  eventDate: string;
  endDate: string;
  isOnline: boolean;
  isPostponed: boolean;
  location: string;
  eventLink: string;
  bannerUrl: string;
  file: File | null;
};

const EMPTY_FORM: FormState = {
  name: '',
  host: '',
  eventDate: '',
  endDate: '',
  isOnline: false,
  isPostponed: false,
  location: '',
  eventLink: '',
  bannerUrl: '',
  file: null,
};

type SortKey = 'date-asc' | 'date-desc' | 'name-asc' | 'host-asc' | 'recent';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date-asc', label: 'Date (soonest first)' },
  { value: 'date-desc', label: 'Date (latest first)' },
  { value: 'recent', label: 'Recently added' },
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'host-asc', label: 'Host (A–Z)' },
];

function sortHackathons(list: Hackathon[], key: SortKey): Hackathon[] {
  const sorted = [...list];
  switch (key) {
    case 'date-asc':
      return sorted.sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.id - b.id);
    case 'date-desc':
      return sorted.sort((a, b) => b.eventDate.localeCompare(a.eventDate) || b.id - a.id);
    case 'recent':
      return sorted.sort((a, b) => b.id - a.id);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'host-asc':
      return sorted.sort((a, b) => a.host.localeCompare(b.host));
    default:
      return sorted;
  }
}

function parseEventDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const parsed = new Date(`${iso}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDateRange(startIso: string, endIso: string): string {
  const start = parseEventDate(startIso);
  if (!start) return startIso || '';
  const end = parseEventDate(endIso);
  if (!end || endIso === startIso) return format(start, 'd MMMM yyyy');
  // Collapse a shared month/year: "5–7 May 2026"; otherwise show both fully.
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${format(start, 'd')}–${format(end, 'd MMMM yyyy')}`;
  }
  return `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`;
}

function HackathonFormFields({
  idPrefix,
  form,
  setForm,
  preview,
  onFileChange,
}: {
  idPrefix: string;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  preview: string | null;
  onFileChange: (file: File | null) => void;
}) {
  const bannerPreview = preview ?? (form.bannerUrl.trim() ? form.bannerUrl.trim() : null);
  const [dateOpen, setDateOpen] = useState(false);
  const fromDate = parseEventDate(form.eventDate);
  const toDate = parseEventDate(form.endDate);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-name`}>Event name</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-host`}>Host</Label>
        <Input
          id={`${idPrefix}-host`}
          value={form.host}
          onChange={(e) => setForm((p) => ({ ...p, host: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-date`}>Date</Label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              id={`${idPrefix}-date`}
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !fromDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="size-4" />
              {fromDate ? formatDateRange(form.eventDate, form.endDate) : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: fromDate, to: toDate }}
              defaultMonth={fromDate}
              captionLayout="dropdown"
              numberOfMonths={1}
              onSelect={(range) =>
                setForm((p) => ({
                  ...p,
                  eventDate: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                  endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
                }))
              }
            />
            <p className="border-t px-3 py-2 text-xs text-muted-foreground">
              Pick a single day, or a start and end for multi-day events.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor={`${idPrefix}-online`}>Online event</Label>
          <p className="text-xs text-muted-foreground">Hides the location field.</p>
        </div>
        <Switch
          id={`${idPrefix}-online`}
          checked={form.isOnline}
          onCheckedChange={(checked) => setForm((p) => ({ ...p, isOnline: checked }))}
        />
      </div>
      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor={`${idPrefix}-postponed`}>Postponed</Label>
          <p className="text-xs text-muted-foreground">Shows a “Postponed” badge on the public card.</p>
        </div>
        <Switch
          id={`${idPrefix}-postponed`}
          checked={form.isPostponed}
          onCheckedChange={(checked) => setForm((p) => ({ ...p, isPostponed: checked }))}
        />
      </div>
      {!form.isOnline && (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-location`}>Location</Label>
          <Input
            id={`${idPrefix}-location`}
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            placeholder="e.g. SEU Permanent Campus, Dhaka"
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-link`}>Event link</Label>
        <Input
          id={`${idPrefix}-link`}
          type="url"
          value={form.eventLink}
          onChange={(e) => setForm((p) => ({ ...p, eventLink: e.target.value }))}
          placeholder="https://example.com/register"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-banner-url`}>Banner URL</Label>
        <Input
          id={`${idPrefix}-banner-url`}
          type="url"
          value={form.bannerUrl}
          onChange={(e) => setForm((p) => ({ ...p, bannerUrl: e.target.value }))}
          placeholder="https://example.com/banner.jpg"
          disabled={!!form.file}
        />
        <p className="text-xs text-muted-foreground">Paste an image URL, or upload a file below.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-banner-file`}>Upload banner</Label>
        <Input
          id={`${idPrefix}-banner-file`}
          type="file"
          accept="image/*"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {bannerPreview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bannerPreview}
          alt="Banner preview"
          className="h-32 w-full rounded-md border object-cover"
        />
      )}
    </div>
  );
}

export default function HackathonAdminClient({ initialHackathons }: Props) {
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>(initialHackathons);

  useEffect(() => {
    setHackathons(initialHackathons);
  }, [initialHackathons]);

  const [sortBy, setSortBy] = useState<SortKey>('date-asc');
  const sortedHackathons = useMemo(() => sortHackathons(hackathons, sortBy), [hackathons, sortBy]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Hackathon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hackathon | null>(null);

  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (createOpen) return;
    setCreateForm(EMPTY_FORM);
    setCreatePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [createOpen]);

  useEffect(() => {
    if (!editTarget) return;
    setEditForm({
      name: editTarget.name,
      host: editTarget.host,
      eventDate: editTarget.eventDate,
      endDate: editTarget.endDate ?? '',
      isOnline: editTarget.isOnline,
      isPostponed: editTarget.isPostponed,
      location: editTarget.location ?? '',
      eventLink: editTarget.eventLink,
      bannerUrl: editTarget.bannerFileId ? '' : editTarget.bannerUrl,
      file: null,
    });
    setEditPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return editTarget.bannerUrl;
    });
  }, [editTarget]);

  function onCreateFileChange(file: File | null) {
    setCreateForm((p) => ({ ...p, file }));
    setCreatePreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function onEditFileChange(file: File | null) {
    setEditForm((p) => ({ ...p, file }));
    setEditPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      if (file) return URL.createObjectURL(file);
      return editTarget?.bannerUrl ?? null;
    });
  }

  function buildFormData(form: FormState): FormData | string {
    if (!form.eventDate) {
      return 'Please pick an event date.';
    }
    if (!form.eventLink.trim() || !isValidEventLink(form.eventLink.trim())) {
      return 'Event link must be a valid http(s) URL.';
    }
    if (!form.isOnline && !form.location.trim()) {
      return 'Location is required for in-person events.';
    }
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('host', form.host.trim());
    fd.append('eventDate', form.eventDate);
    fd.append('endDate', form.endDate);
    fd.append('isOnline', String(form.isOnline));
    fd.append('isPostponed', String(form.isPostponed));
    fd.append('location', form.isOnline ? '' : form.location.trim());
    fd.append('eventLink', form.eventLink.trim());
    if (form.file) {
      fd.append('banner', form.file);
    } else if (form.bannerUrl.trim()) {
      fd.append('bannerUrl', form.bannerUrl.trim());
    }
    return fd;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!createForm.file && !createForm.bannerUrl.trim()) {
      toast.error('A banner image (upload or URL) is required.');
      return;
    }
    const built = buildFormData(createForm);
    if (typeof built === 'string') {
      toast.error(built);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/hackathons', { method: 'POST', body: built });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'Failed to create hackathon.');
        return;
      }
      setCreateOpen(false);
      toast.success('Hackathon created.');
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
    const built = buildFormData(editForm);
    if (typeof built === 'string') {
      toast.error(built);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/hackathons/${editTarget.id}`, {
        method: 'PATCH',
        body: built,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'Failed to update hackathon.');
        return;
      }
      setEditTarget(null);
      toast.success('Hackathon updated.');
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
      const res = await fetch(`/api/admin/hackathons/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'Failed to delete hackathon.');
        return;
      }
      setDeleteTarget(null);
      toast.success('Hackathon deleted.');
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
          <h1 className="text-2xl font-semibold">Hackathons</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage events shown on the public Hackathon Tracker.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Add hackathon
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Events ({hackathons.length})</CardTitle>
          {hackathons.length > 1 && (
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger size="sm" className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent align="end">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {hackathons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hackathons yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedHackathons.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 rounded-md border bg-background p-3"
                >
                  <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.bannerUrl} alt={h.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{h.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{h.host}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {formatDateRange(h.eventDate, h.endDate ?? '')}
                      </span>
                      {h.isPostponed && (
                        <span className="inline-flex items-center rounded bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                          Postponed
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        {h.isOnline ? (
                          <>
                            <Globe className="size-3" />
                            Online
                          </>
                        ) : (
                          <>
                            <MapPin className="size-3" />
                            {h.location}
                          </>
                        )}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditTarget(h)}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setDeleteTarget(h)}>
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add hackathon</DialogTitle>
            <DialogDescription>Banner (upload or URL), name, host, date, and link.</DialogDescription>
          </DialogHeader>
          <form id="create-hackathon-form" onSubmit={handleCreate}>
            <HackathonFormFields
              idPrefix="c"
              form={createForm}
              setForm={setCreateForm}
              preview={createPreview}
              onFileChange={onCreateFileChange}
            />
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="create-hackathon-form" disabled={saving}>
              {saving ? 'Saving…' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-md max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit hackathon</DialogTitle>
            <DialogDescription>Leave banner fields untouched to keep the current image.</DialogDescription>
          </DialogHeader>
          <form id="edit-hackathon-form" onSubmit={handleEdit}>
            <HackathonFormFields
              idPrefix="e"
              form={editForm}
              setForm={setEditForm}
              preview={editPreview}
              onFileChange={onEditFileChange}
            />
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="edit-hackathon-form" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete hackathon?</DialogTitle>
            <DialogDescription>
              This removes <strong>{deleteTarget?.name}</strong> from the public page
              {deleteTarget?.bannerFileId ? ' and deletes its uploaded banner from Cloudinary' : ''}.
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
