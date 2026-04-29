'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

type Step = 'idle' | 'previewing' | 'uploading' | 'done';

interface PreviewData {
  preview: Record<string, string>[];
  totalRows: number;
  columns: string[];
}

export default function UploadClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selected: File) => {
    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Only .csv, .xlsx, and .xls files are supported.');
      toast.error('Only .csv, .xlsx, and .xls files are supported.');
      return;
    }
    setFile(selected);
    setError(null);
    setPreviewData(null);
    setStep('idle');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'preview');

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? 'Failed to preview file.';
        setError(message);
        toast.error(message);
        return;
      }
      setPreviewData(data);
      setStep('previewing');
    } catch {
      setError('Failed to connect to server.');
      toast.error('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setStep('uploading');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'confirm');

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? 'Upload failed.';
        setError(message);
        toast.error(message);
        setStep('previewing');
        return;
      }
      setStep('done');
      toast.success(`Upload successful — ${data.rowsInserted.toLocaleString()} rows inserted.`);
      router.refresh();
    } catch {
      setError('Failed to connect to server.');
      toast.error('Failed to connect to server.');
      setStep('previewing');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    setStep('idle');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload Exam Routine</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload a CSV or Excel file to replace the current exam schedule.
        </p>
      </div>

      {step === 'done' ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CheckCircle2 className="size-12 text-green-500" />
            <div className="text-center">
              <p className="font-semibold text-lg">Upload Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                {previewData?.totalRows.toLocaleString()} rows inserted into the database.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset}>Upload Another</Button>
              <Button onClick={() => router.push('/admin/dashboard')}>Go to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* File drop zone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select File</CardTitle>
              <CardDescription>Supported formats: .csv, .xlsx, .xls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="size-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 ml-2"
                      onClick={e => { e.stopPropagation(); handleReset(); }}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="size-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Drop file here or click to browse</p>
                    <p className="text-xs text-muted-foreground">.csv, .xlsx, .xls</p>
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {file && step === 'idle' && (
                <Button onClick={handlePreview} disabled={loading} className="w-full">
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {loading ? 'Loading preview…' : 'Preview File'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Preview table */}
          {step === 'previewing' && previewData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Preview</CardTitle>
                    <CardDescription className="mt-0.5">
                      Showing first {previewData.preview.length} of{' '}
                      <Badge variant="secondary">{previewData.totalRows.toLocaleString()} rows</Badge>
                    </CardDescription>
                  </div>
                  <Alert variant="destructive" className="w-auto py-2 px-3">
                    <AlertCircle className="size-4" />
                    <AlertDescription className="text-xs">
                      This will replace ALL existing exam data.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        {previewData.columns.map(col => (
                          <th key={col} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewData.preview.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          {previewData.columns.map(col => (
                            <td key={col} className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate">
                              {row[col] ?? '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleReset} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm} disabled={loading}>
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    {loading ? 'Uploading…' : `Confirm & Upload ${previewData.totalRows.toLocaleString()} Rows`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'uploading' && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Uploading exam data…</p>
                <p className="text-xs text-muted-foreground">This may take a moment for large files.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
