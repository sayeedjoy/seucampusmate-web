'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Database, Clock, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { UploadHistory, ExamSchedule } from '@/lib/db/schema';
import { toast } from 'sonner';

type HistoryWithAdmin = UploadHistory & { uploadedByName: string | null };
type PreviewRow = Pick<
  ExamSchedule,
  'program' | 'slot' | 'date' | 'startTime' | 'endTime' | 'courseCode' | 'courseTitle' | 'students' | 'faculty'
>;

interface Props {
  totalRows: number;
  history: HistoryWithAdmin[];
  previewRows: PreviewRow[];
}

const PREVIEW_COLUMNS: Array<{ key: keyof PreviewRow; label: string }> = [
  { key: 'program', label: 'Program' },
  { key: 'slot', label: 'Slot' },
  { key: 'date', label: 'Date' },
  { key: 'startTime', label: 'Start Time' },
  { key: 'endTime', label: 'End Time' },
  { key: 'courseCode', label: 'Course Code' },
  { key: 'courseTitle', label: 'Course Title' },
  { key: 'students', label: 'Students' },
  { key: 'faculty', label: 'Faculty' },
];

export default function DashboardClient({ totalRows, history, previewRows }: Props) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/routine', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteOpen(false);
      toast.success('Exam routine deleted.');
      router.refresh();
    } catch {
      toast.error('Failed to delete routine.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Exam routine management</p>
        </div>
        <Button asChild>
          <Link href="/admin/upload">
            <Upload className="size-4" />
            Upload Routine
          </Link>
        </Button>
      </div>
      <div className="flex justify-end gap-2">
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" disabled={totalRows === 0}>
              <Trash2 className="size-4" />
              Delete Routine
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Current Routine?</DialogTitle>
              <DialogDescription>
                This will permanently delete all {totalRows.toLocaleString()} exam entries from the database.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete All'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={totalRows === 0}>
              <Eye className="size-4" />
              Preview Current Data
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[98vw] w-[1400px]">
            <DialogHeader>
              <DialogTitle>Current Exam Data Preview</DialogTitle>
              <DialogDescription>
                Showing first {previewRows.length} rows from the current database snapshot.
              </DialogDescription>
            </DialogHeader>
            {previewRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exam data found.</p>
            ) : (
              <div className="max-h-[65vh] overflow-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {PREVIEW_COLUMNS.map(col => (
                        <th key={col.key} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewRows.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        {PREVIEW_COLUMNS.map(col => (
                          <td key={col.key} className="px-3 py-2 whitespace-nowrap max-w-[220px] truncate">
                            {row[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="size-4" />
              Exam Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalRows.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">rows in database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="size-4" />
              Last Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <>
                <p className="text-sm font-medium truncate">{history[0].filename}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(history[0].uploadedAt), 'dd MMM yyyy, hh:mm a')}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No uploads yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No uploads yet. Upload your first exam routine above.
            </p>
          ) : (
            <div className="space-y-0 divide-y">
              {history.map(record => (
                <div key={record.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{record.filename}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {record.rowCount.toLocaleString()} rows
                      {record.uploadedByName ? ` · ${record.uploadedByName}` : ''}
                      {' · '}
                      {format(new Date(record.uploadedAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                    {record.errorMessage && (
                      <p className="text-xs text-destructive mt-0.5">{record.errorMessage}</p>
                    )}
                  </div>
                  <Badge
                    variant={record.status === 'success' ? 'default' : 'destructive'}
                    className="ml-3 shrink-0"
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
