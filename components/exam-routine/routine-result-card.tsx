'use client';

import { type RefObject, useMemo } from 'react';
import { ExamResult } from '@/lib/exam-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Clock, User, CheckCircle2, CalendarSearch } from 'lucide-react';

export type ExamWithSearchCode = ExamResult & { searchCode: string };

export interface ExamRoutineResultsProps {
  loading: boolean;
  error: string | null;
  totalResults: number;
  resultsCount: number;
  allExams: ExamWithSearchCode[];
  formatDate: (date: string) => string;
  formatTime: (startTime: string, endTime: string) => string;
  getDaysRemaining: (date: string) => number | null;
  scheduleRef?: RefObject<HTMLDivElement | null>;
}

type ExamStatus = 'past' | 'today' | 'tomorrow' | 'upcoming' | 'unknown';

function getStatus(days: number | null): ExamStatus {
  if (days === null) return 'unknown';
  if (days < 0) return 'past';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return 'upcoming';
}

function parseTimeToMinutes(time: string): number {
  if (!time) return 0;
  const match = time.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Minimal DD/MM/YYYY-first parser to split the date into rail labels.
function parseDate(s: string): Date | null {
  if (!s || !s.trim()) return null;
  const parts = s.trim().split(/[/\-.]/);
  if (parts.length === 3 && parts[2].length === 4) {
    const d = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const y = Number(parts[2]);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) return dt;
    }
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

const NODE_COLOR: Record<ExamStatus, string> = {
  today: 'bg-primary ring-primary/25',
  tomorrow: 'bg-primary ring-primary/20',
  upcoming: 'bg-primary/50 ring-primary/15',
  past: 'bg-muted-foreground/40 ring-muted-foreground/10',
  unknown: 'bg-border ring-transparent',
};

function Countdown({ status, days }: { status: ExamStatus; days: number | null }) {
  const isToday = status === 'today';
  const isPast = status === 'past';

  const label =
    status === 'today'
      ? 'Today'
      : status === 'tomorrow'
        ? 'Tomorrow'
        : status === 'past'
          ? 'Done'
          : status === 'unknown'
            ? 'TBD'
            : `${days} days`;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
        isToday && 'bg-primary text-primary-foreground',
        isPast && 'bg-muted text-muted-foreground',
        !isToday && !isPast && 'bg-primary/10 text-primary'
      )}
    >
      {isPast ? (
        <CheckCircle2 className="size-3" />
      ) : isToday ? (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-foreground/70 motion-reduce:hidden" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary-foreground" />
        </span>
      ) : null}
      {label}
    </span>
  );
}

export default function ExamRoutineResults({
  loading,
  error,
  totalResults,
  resultsCount,
  allExams,
  formatDate,
  formatTime,
  getDaysRemaining,
  scheduleRef,
}: ExamRoutineResultsProps) {
  // Group chronologically-sorted exams by date.
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { label: string; raw: string; days: number | null; exams: ExamWithSearchCode[] }
    >();
    for (const exam of allExams) {
      const label = formatDate(exam.date);
      const existing = map.get(label);
      if (existing) {
        existing.exams.push(exam);
      } else {
        map.set(label, {
          label,
          raw: exam.date,
          days: getDaysRemaining(exam.date),
          exams: [exam],
        });
      }
    }
    const groups = Array.from(map.values());
    for (const group of groups) {
      group.exams.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
    }
    return groups;
  }, [allExams, formatDate, getDaysRemaining]);

  if (loading) {
    return (
      <div className="min-h-[400px]">
        <div className="mx-auto max-w-3xl space-y-6 pt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
              <Skeleton className="h-20 flex-1 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px]">
        <Alert variant="destructive" className="mx-auto max-w-3xl">
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="min-h-[400px]">
        <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarSearch className="size-7" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No exams to show yet</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Enter one or more course codes above to view exam dates, times, and faculty — sorted from soonest to latest.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px]">
      <div className="mx-auto max-w-3xl">
        {/* Summary header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Exam Schedule</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{totalResults}</span>{' '}
            {totalResults === 1 ? 'exam' : 'exams'} across{' '}
            <span className="font-medium text-foreground">{resultsCount}</span>{' '}
            {resultsCount === 1 ? 'course' : 'courses'}
          </p>
        </div>

        {/* Timeline */}
        <div ref={scheduleRef as RefObject<HTMLDivElement>} style={{ contentVisibility: 'auto', containIntrinsicSize: '0 320px' }}>
          {grouped.map((group, gi) => {
            const status = getStatus(group.days);
            const date = parseDate(group.raw);
            const isLast = gi === grouped.length - 1;

            return (
              <div key={group.label} className={cn('relative flex gap-3 sm:gap-4', !isLast && 'pb-7')}>
                {/* Date column */}
                <div className="w-11 shrink-0 pt-0.5 text-right sm:w-12">
                  {date ? (
                    <>
                      <div className="text-xl font-bold leading-none text-foreground">{date.getDate()}</div>
                      <div className="mt-0.5 text-xs font-medium uppercase text-muted-foreground">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs font-medium text-muted-foreground">TBD</div>
                  )}
                </div>

                {/* Rail */}
                <div className="relative flex w-3 shrink-0 justify-center">
                  <span
                    className={cn(
                      'absolute top-2 z-10 size-3 rounded-full ring-4',
                      NODE_COLOR[status]
                    )}
                  />
                  <span className={cn('absolute top-2 w-px bg-border', isLast ? 'bottom-0' : '-bottom-7')} aria-hidden />
                </div>

                {/* Exams for this date */}
                <ul className="min-w-0 flex-1 space-y-2.5">
                  {group.exams.map((exam, index) => (
                    <li
                      key={`${exam.courseCode}-${index}`}
                      className={cn(
                        'rounded-lg border border-border bg-card px-4 py-3',
                        status === 'past' && 'opacity-70'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-snug text-foreground">
                          {exam.courseTitle}
                        </h4>
                        {/* Show countdown once per date, on the first exam */}
                        {index === 0 && <Countdown status={status} days={group.days} />}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                          {exam.courseCode}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Clock className="size-3.5" />
                          {formatTime(exam.startTime, exam.endTime)}
                        </span>
                      </div>

                      <p
                        className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground"
                        title={exam.faculty}
                      >
                        <User className="size-3.5 shrink-0" />
                        <span className="truncate">{exam.faculty}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
