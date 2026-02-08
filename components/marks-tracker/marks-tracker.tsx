"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  COURSE_COMPONENT_KEYS,
  COURSE_COMPONENT_LABELS,
  Course,
  CourseComponents,
  DEFAULT_COMPONENTS,
  Grade,
  GRADE_OPTIONS,
  calculateCurrentTotals,
  computeRequiredFinalMarks,
  validateNonFinalCap,
} from "@/lib/marks";

// Local storage helpers
const STORAGE_KEY = "marks-tracker:courses:v1";

function loadCourses(): Course[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Course[]) : [];
  } catch {
    return [];
  }
}

function saveCourses(courses: Course[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Dialog components (simple headless modal)
function Modal({ open, onClose, children, ariaLabel }: { open: boolean; onClose: () => void; children: React.ReactNode; ariaLabel: string; }) {
  if (!open) return null;
  return (
    <div
      aria-label={ariaLabel}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm"
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-auto my-8 rounded-3xl bg-card shadow-2xl border border-border max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  id,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  id: string;
  placeholder?: string;
}) {
  const [displayValue, setDisplayValue] = React.useState(value.toString());

  React.useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Allow empty string or valid numbers (including decimals)
    if (inputValue === '' || inputValue === '.') {
      onChange(0);
    } else {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue) && numValue >= 0) {
        onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    // Clean up display on blur - show the actual stored value
    setDisplayValue(value.toString());
  };

  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder || "0"}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
      />
    </label>
  );
}

function Select({ label, value, onChange, options, id }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  id: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
      >
        {options.map((opt) => (
          <option value={opt} key={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

// Form state
type CourseDraft = {
  id?: string;
  name: string;
  components: CourseComponents;
  targetGrade: Grade;
};

function emptyDraft(): CourseDraft {
  return {
    name: "",
    components: { ...DEFAULT_COMPONENTS },
    targetGrade: "A+",
  };
}

export function MarksTracker() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<CourseDraft>(emptyDraft());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  useEffect(() => {
    // Add a small delay to prevent flash and ensure smooth loading
    const loadData = async () => {
      const loadedCourses = loadCourses();
      setCourses(loadedCourses);
      // Small delay to prevent flash on fast connections
      await new Promise(resolve => setTimeout(resolve, 150));
      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    saveCourses(courses);
  }, [courses]);

  const openCreate = () => {
    setDraft(emptyDraft());
    setModalOpen(true);
  };

  const openEdit = (c: Course) => {
    setDraft({ id: c.id, name: c.name, components: JSON.parse(JSON.stringify(c.components)), targetGrade: c.targetGrade });
    setModalOpen(true);
  };

  const upsertCourse = () => {
    if (!draft.name.trim()) return;

    // Allow saving even if validation warnings exist - users can decide
    if (draft.id) {
      setCourses((prev) => prev.map((c) => (c.id === draft.id ? { ...c, name: draft.name.trim(), components: draft.components, targetGrade: draft.targetGrade } : c)));
    } else {
      const newCourse: Course = {
        id: uid(),
        name: draft.name.trim(),
        components: draft.components,
        targetGrade: draft.targetGrade,
        createdAt: Date.now(),
      };
      setCourses((prev) => [newCourse, ...prev]);
    }
    setModalOpen(false);
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
  };

  const clearAllCourses = () => {
    setCourses([]);
    setShowClearAllConfirm(false);
  };

  return (
    <div className="relative">
      {/* Optional background overlay */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern" aria-hidden />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Semester Marks Tracker</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Track your progress and plan for success</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {courses.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowClearAllConfirm(true)}
              aria-label="Clear all courses"
              className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </Button>
          )}
          <Button onClick={openCreate} aria-label="Add new course" className="w-full sm:w-auto" disabled={isLoading}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Course
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4 md:space-y-6">
          {/* Loading skeleton */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="mb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded-md w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded-md w-1/2"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-8 h-8 bg-muted rounded-lg"></div>
                      <div className="w-8 h-8 bg-muted rounded-lg"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <div key={j} className="rounded-lg border border-border bg-muted p-2 md:p-3">
                        <div className="h-3 bg-muted rounded w-full mb-1"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Courses content with fade-in animation */
        <div className="animate-fade-in">
          {/* Courses grid */}
          {courses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
                  <p className="text-muted-foreground mb-6">Start tracking your academic progress by adding your first course.</p>
                  <div className="space-y-3">
                    <Button onClick={openCreate} className="w-full sm:w-auto">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Your First Course
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      💡 Starting a new semester? Use "Clear All" when you have courses to remove previous semester data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} onEdit={() => openEdit(course)} onDelete={() => setConfirmDeleteId(course.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating action button - only show on mobile when courses exist */}
      {courses.length > 0 && (
        <button
          className="fixed bottom-6 right-4 md:hidden h-14 w-14 rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 transition-all duration-200 z-40"
          onClick={openCreate}
          aria-label="Add new course"
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Create/Edit Modal */}
      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} ariaLabel="Add or edit course">
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Modal Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{draft.id ? "Edit Course" : "Add New Course"}</h3>
                <p className="text-sm text-muted-foreground mt-1">Configure your course assessment breakdown</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Course Name Section */}
            <div className="space-y-2">
              <label className="block">
                <span className="text-sm font-medium text-foreground">Course Name</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="e.g., CSE 3101 - Data Structures & Algorithms"
                  className="mt-2 w-full rounded-xl border border-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                  aria-invalid={!draft.name.trim()}
                />
              </label>
            </div>

            {/* Assessment Components Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Assessment Components</h4>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Non-final max: 70</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COURSE_COMPONENT_KEYS.map((key) => (
                  <div key={key} className="group rounded-xl border border-border bg-gradient-to-br from-muted to-card p-4 hover:border-violet-200 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-foreground">{COURSE_COMPONENT_LABELS[key]}</h5>
                      <div className="w-2 h-2 rounded-full bg-violet-200 group-hover:bg-violet-300 transition-colors"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberInput
                        id={`${key}-total`}
                        label="Total"
                        value={draft.components[key].total}
                        placeholder="20"
                        onChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            components: { ...d.components, [key]: { ...d.components[key], total: v } },
                          }))
                        }
                      />
                      <NumberInput
                        id={`${key}-obtained`}
                        label="Obtained"
                        value={draft.components[key].obtained}
                        placeholder="15"
                        onChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            components: { ...d.components, [key]: { ...d.components[key], obtained: v } },
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Grade and Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Select
                  id="target-grade"
                  label="Target Grade"
                  value={draft.targetGrade}
                  onChange={(v) => setDraft((d) => ({ ...d, targetGrade: v as Grade }))}
                  options={GRADE_OPTIONS}
                />
              </div>

              {/* Live calculation summary */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Summary</span>
                <LiveSummaryEnhanced components={draft.components} targetGrade={draft.targetGrade} />
              </div>
            </div>

            {/* Validation message */}
            <ValidationBanner components={draft.components} courseNameValid={!!draft.name.trim()} />
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-muted border-t border-border px-6 py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(false)} size="sm" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={upsertCourse} aria-label="Save course" size="sm" className="w-full sm:w-auto">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {draft.id ? "Save Changes" : "Add Course"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} ariaLabel="Confirm deletion">
        <div className="p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.732-.833-2.5 0L4.234 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Delete Course</h3>
          </div>
          <p className="text-muted-foreground mb-6">Are you sure you want to delete this course? This action cannot be undone and all your progress data will be lost.</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDeleteId(null)} size="sm" className="w-full sm:w-auto">Cancel</Button>
            <Button
              variant="outline"
              onClick={() => confirmDeleteId && deleteCourse(confirmDeleteId)}
              size="sm"
              className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50"
            >
              Delete Course
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clear All confirmation */}
      <Modal open={showClearAllConfirm} onClose={() => setShowClearAllConfirm(false)} ariaLabel="Confirm clear all">
        <div className="p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Clear All Courses</h3>
              <p className="text-sm text-muted-foreground">End of semester cleanup</p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.732-.833-2.5 0L4.234 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-orange-800">This will permanently delete all {courses.length} courses</p>
                <p className="text-sm text-orange-700 mt-1">All your marks, targets, and progress data will be removed. This action cannot be undone.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowClearAllConfirm(false)} size="sm" className="w-full sm:w-auto">
              Keep Courses
            </Button>
            <Button
              variant="outline"
              onClick={clearAllCourses}
              size="sm"
              className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Courses
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function LiveSummaryEnhanced({ components, targetGrade }: { components: CourseComponents; targetGrade: Grade }) {
  const totals = useMemo(() => calculateCurrentTotals(components), [components]);
  const req = useMemo(() => computeRequiredFinalMarks(components, targetGrade), [components, targetGrade]);
  const percentage = totals.total > 0 ? Math.round((totals.obtained / totals.total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-violet-50 to-card dark:from-violet-950/20 dark:to-card p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Current Progress</span>
          <span className="text-xs font-semibold text-violet-600">{percentage}%</span>
        </div>

        <div className="text-sm">
          <div className="text-foreground font-medium">{totals.obtained} / {Math.min(70, totals.total)} marks</div>
          <div className="text-gray-500 text-xs">Non-final components</div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground mb-1">Required for {targetGrade}:</div>
          <div className={`text-sm font-semibold ${req.achievable ? "text-green-700" : "text-red-600"}`}>
            {req.requiredClamped} / 30 final marks
          </div>
          {!req.achievable && (
            <div className="text-xs text-red-500 mt-1">Target not achievable</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ValidationBanner({ components, courseNameValid }: { components: CourseComponents; courseNameValid: boolean }) {
  const cap = validateNonFinalCap(components);

  if (!courseNameValid) {
    return <div className="rounded-lg bg-error/10 border border-error text-error px-3 py-2 text-sm">Course name is required.</div>;
  }

  if (!cap.valid) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 text-sm">
        ⚠️ Sum of non-final totals is {cap.totalNonFinal}. Typically should be 70 or less for standard grading.
      </div>
    );
  }

  // Show helpful tips
  const totals = calculateCurrentTotals(components);
  if (totals.total < 60) {
    return (
      <div className="rounded-lg bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 text-sm">
        💡 Tip: Most courses have non-final components totaling 60-70 marks, with final exam worth 30-40 marks.
      </div>
    );
  }

  return null;
}

function CourseCard({ course, onEdit, onDelete }: { course: Course; onEdit: () => void; onDelete: () => void }) {
  const totals = calculateCurrentTotals(course.components);
  const req = computeRequiredFinalMarks(course.components, course.targetGrade);

  return (
    <Card>
      <CardHeader className="mb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-xl truncate">{course.name}</CardTitle>
            <div className="text-xs md:text-sm text-gray-500 mt-1">
              <span className="block sm:inline">Target: <span className="font-medium">{course.targetGrade}</span></span>
              <span className="hidden sm:inline sm:mx-2">•</span>
              <span className="block sm:inline">Required Final: <span className={`font-medium ${req.achievable ? "text-muted-foreground" : "text-red-600"}`}>{req.requiredClamped}/30</span></span>
              {!req.achievable && <span className="text-red-600 text-xs block sm:inline sm:ml-1">(Not achievable)</span>}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              aria-label="Edit course"
              onClick={onEdit}
              className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg text-muted-foreground hover:text-violet-600 hover:bg-violet-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              aria-label="Delete course"
              onClick={onDelete}
              className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm">
          {COURSE_COMPONENT_KEYS.map((key) => {
            const c = course.components[key];
            return (
              <div key={key} className="rounded-lg border border-border bg-muted p-2 md:p-3">
                <div className="text-muted-foreground truncate" title={COURSE_COMPONENT_LABELS[key]}>{COURSE_COMPONENT_LABELS[key]}</div>
                <div className="font-medium text-foreground">{c.obtained} / {c.total}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <div className="text-muted-foreground font-medium">Current: {totals.obtained} / {Math.min(70, totals.total)} (non-final)</div>
          <div className="text-muted-foreground font-medium">Target: {course.targetGrade}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MarksTracker;
