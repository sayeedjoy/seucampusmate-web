import { Badge } from "@/components/ui/badge";
import { CourseCard } from "./course-card";
import { type Course } from "@/app/course-catalog/types";

interface CourseSectionProps {
    title: string;
    subtitle?: string;
    courses: Course[];
}

export function CourseSection({ title, subtitle, courses }: CourseSectionProps) {
    return (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section Header */}
            <div className="flex flex-col gap-2 pb-4 border-b border-zinc-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2 sm:gap-3 flex-wrap">
                        {title}
                        <Badge variant="secondary" className="rounded-md bg-primary/10 text-primary border-none px-2.5 py-0.5 sm:px-3 sm:py-1 font-bold text-xs sm:text-sm shadow-none">
                            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                        </Badge>
                    </h2>
                </div>
                {subtitle && (
                    <p className="text-sm text-zinc-500 font-medium max-w-2xl">{subtitle}</p>
                )}
            </div>

            {/* Course Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                {courses.map((course) => (
                    <CourseCard key={course.code} course={course} />
                ))}
            </div>
        </section>
    );
}
