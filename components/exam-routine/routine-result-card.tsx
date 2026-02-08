'use client';

import { type RefObject } from 'react';
import { ExamResult } from '@/lib/exam-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Calendar, Clock, User, Check, Zap, Timer } from 'lucide-react';

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
  return (
    <div className="min-h-[400px]">
      {loading && (
        <div className="text-center py-12 transition-opacity duration-200">
          <div className="inline-flex items-center justify-center w-8 h-8 mb-4">
            <span className="size-6 border-2 border-muted border-t-foreground rounded-full animate-spin motion-reduce:animate-none" aria-hidden />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Searching Your Exams…</h3>
          <p className="text-sm text-muted-foreground">Looking up exam schedules for your courses.</p>
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive" className="mb-6 transition-opacity duration-200">
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && totalResults > 0 && (
        <div className="space-y-6 transition-opacity duration-300">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Exam Schedule</h2>
              <p className="text-sm text-muted-foreground">
                {totalResults} {totalResults === 1 ? 'exam' : 'exams'} • {resultsCount}{' '}
                {resultsCount === 1 ? 'course' : 'courses'}
              </p>
            </div>

            <div
              ref={scheduleRef as RefObject<HTMLDivElement>}
              className="space-y-4"
              style={{ contentVisibility: 'auto', containIntrinsicSize: '0 200px' }}
            >
              {allExams.map((exam, index) => {
                const daysRemaining = getDaysRemaining(exam.date);
                const isPast = daysRemaining !== null && daysRemaining < 0;
                const isToday = daysRemaining === 0;

                return (
                  <Card
                    key={`${exam.courseCode}-${index}`}
                    className={cn(
                      'border-border shadow-sm transition-shadow duration-200 cursor-default',
                      isPast && 'opacity-60'
                    )}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {daysRemaining !== null && (
                            <Badge
                              className={cn(
                                'font-medium',
                                isToday && 'bg-primary text-primary-foreground',
                                isPast && 'bg-muted text-muted-foreground',
                                !isPast && !isToday && 'bg-primary/10 text-primary border border-primary/20'
                              )}
                              aria-label={
                                isPast
                                  ? 'Exam completed'
                                  : isToday
                                    ? 'Exam today'
                                    : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`
                              }
                            >
                              {isPast ? (
                                <>
                                  <Check className="size-3 mr-1" />
                                  Completed
                                </>
                              ) : isToday ? (
                                <>
                                  <Zap className="size-3 mr-1" />
                                  Today
                                </>
                              ) : (
                                <>
                                  <Timer className="size-3 mr-1" />
                                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                                </>
                              )}
                            </Badge>
                          )}
                          <CardTitle className="text-lg md:text-xl font-semibold text-foreground leading-tight">
                            {exam.courseTitle}
                          </CardTitle>
                        </div>
                        <Badge className="text-xs font-semibold shrink-0 bg-foreground text-background hover:bg-foreground/90">
                          {exam.courseCode}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Date
                          </p>
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            {formatDate(exam.date)}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Time
                          </p>
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Clock className="size-4 text-muted-foreground" />
                            {formatTime(exam.startTime, exam.endTime)}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Faculty
                          </p>
                          <p className="text-sm font-medium text-foreground flex items-center gap-2" title={exam.faculty}>
                            <User className="size-4 text-muted-foreground shrink-0" />
                            <span className="break-words">{exam.faculty}</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!loading && totalResults === 0 && !error && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-foreground mb-2">Ready to search exam schedules</h3>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Enter one or more course codes above to view exam dates, times, and faculty information.
          </p>
        </div>
      )}
    </div>
  );
}
