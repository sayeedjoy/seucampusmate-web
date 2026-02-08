'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Image } from 'lucide-react';

export interface ExamRoutineDownloadProps {
  totalResults: number;
  downloading: boolean;
  onDownloadPDF: () => Promise<void>;
  onDownloadPNG: () => Promise<void>;
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
    <div className="mt-6 mb-6 max-w-5xl mx-auto">
      <Card className="border-border shadow-sm transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Export Your Schedule</h3>
            <p className="text-sm text-muted-foreground">
              Download your exam schedule for offline access
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onDownloadPDF}
              disabled={downloading}
              className="cursor-pointer transition-colors duration-200 w-full sm:w-auto gap-2"
              aria-label="Download as PDF"
            >
              {downloading ? (
                <>
                  <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Generating PDF…</span>
                </>
              ) : (
                <>
                  <FileDown className="size-4" />
                  <span>Download PDF</span>
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={onDownloadPNG}
              disabled={downloading}
              className="cursor-pointer transition-colors duration-200 w-full sm:w-auto gap-2"
              aria-label="Download as PNG"
            >
              {downloading ? (
                <>
                  <span className="size-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  <span>Generating PNG…</span>
                </>
              ) : (
                <>
                  <Image className="size-4" />
                  <span>Download PNG</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
