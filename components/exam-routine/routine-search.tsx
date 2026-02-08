'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Search, RotateCw, X } from 'lucide-react';

export type ValidationVariant = 'error' | 'warning';

export interface RoutineSearchProps {
  courseCode: string;
  courseCodes: string[];
  loading: boolean;
  refreshing: boolean;
  validationError: string | null;
  validationVariant?: ValidationVariant;
  onCourseCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveCode: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onRefresh: () => void;
  onClearAll: () => void;
}

const COURSE_INPUT_ID = 'course-code-input';

export default function RoutineSearch({
  courseCode,
  courseCodes,
  loading,
  refreshing,
  validationError,
  validationVariant = 'error',
  onCourseCodeChange,
  onKeyPress,
  onRemoveCode,
  onSubmit,
  onRefresh,
  onClearAll,
}: RoutineSearchProps) {
  const hasError = !!validationError && validationVariant === 'error';
  const hasWarning = !!validationError && validationVariant === 'warning';
  const canSubmit = !loading && !refreshing && (courseCodes.length > 0 || !!courseCode.trim());

  return (
    <div className="max-w-5xl mx-auto mb-10">
      <Card className="border-border shadow-sm transition-shadow duration-200">
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor={COURSE_INPUT_ID} className="text-sm font-medium text-foreground">
                Course Code
              </Label>
              <Input
                id={COURSE_INPUT_ID}
                type="text"
                value={courseCode}
                onChange={onCourseCodeChange}
                onKeyDown={(e) => onKeyPress(e as React.KeyboardEvent<HTMLInputElement>)}
                placeholder="e.g., CSE181.5, CSE361.2"
                className={cn(
                  'h-11 px-4 py-2 text-sm transition-colors duration-200',
                  hasError && 'border-destructive aria-invalid'
                )}
                disabled={loading || refreshing}
                autoComplete="off"
                aria-invalid={hasError}
                aria-describedby={validationError ? 'validation-message' : undefined}
              />
              <p id="validation-message" className="text-xs text-muted-foreground">
                Separate multiple codes with commas or press Enter after each
              </p>
            </div>

            {courseCodes.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Selected ({courseCodes.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {courseCodes.map((code, index) => (
                    <Badge
                      key={`${code}-${index}`}
                      variant="secondary"
                      className="pl-3 pr-2 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors duration-200 cursor-default"
                    >
                      {code.toUpperCase()}
                      <button
                        type="button"
                        onClick={() => onRemoveCode(code)}
                        className="ml-1.5 rounded-sm hover:bg-primary/30 p-0.5 transition-colors duration-200 cursor-pointer min-w-[22px] min-h-[22px] inline-flex items-center justify-center"
                        disabled={loading}
                        aria-label={`Remove course ${code}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="submit"
                disabled={!canSubmit}
                size="default"
                className="cursor-pointer transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="size-4" />
                    Search Exams
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onRefresh}
                disabled={loading || refreshing}
                className="cursor-pointer transition-colors duration-200"
              >
                {refreshing ? (
                  <>
                    <span className="size-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    <span className="hidden sm:inline">Refreshing...</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="size-4" />
                    <span className="hidden sm:inline">Refresh Data</span>
                    <span className="sm:hidden">Refresh</span>
                  </>
                )}
              </Button>
              {courseCodes.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClearAll}
                  disabled={loading}
                  className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Clear All
                </Button>
              )}
            </div>

            {validationError && (
              <Alert
                variant={hasWarning ? 'warning' : 'destructive'}
                className="transition-opacity duration-200"
              >
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
