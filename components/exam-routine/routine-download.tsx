'use client';

import { FileText, ImageIcon, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExamRoutineDownloadProps {
  totalResults: number;
  downloading: boolean;
  onDownloadPDF: () => Promise<void>;
  onDownloadPNG: () => Promise<void>;
}

interface FormatOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

function FormatOption({ icon, title, description, disabled, loading, onClick }: FormatOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left ring-1 ring-foreground/5 transition-all duration-200',
        'hover:border-primary/40 hover:ring-primary/20 hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:cursor-not-allowed disabled:opacity-60'
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {loading ? <Loader2 className="size-5 animate-spin" /> : icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {loading ? 'Generating…' : title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{description}</span>
      </span>
      <Download className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5 group-hover:text-primary" />
    </button>
  );
}

export default function ExamRoutineDownload({
  totalResults,
  downloading,
  onDownloadPDF,
  onDownloadPNG,
}: ExamRoutineDownloadProps) {
  if (totalResults === 0) {
    return null;
  }

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Export schedule</h3>
            <p className="text-xs text-muted-foreground">
              Save all {totalResults} {totalResults === 1 ? 'exam' : 'exams'} for offline access
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormatOption
            icon={<FileText className="size-5" />}
            title="Download PDF"
            description="Printable document, ideal for sharing"
            disabled={downloading}
            loading={downloading}
            onClick={onDownloadPDF}
          />
          <FormatOption
            icon={<ImageIcon className="size-5" />}
            title="Download PNG"
            description="Image to save or post on your phone"
            disabled={downloading}
            loading={downloading}
            onClick={onDownloadPNG}
          />
        </div>
      </div>
    </div>
  );
}
