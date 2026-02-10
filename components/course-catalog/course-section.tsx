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
        <section className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section Header */}
            <div className="flex flex-col gap-1.5 sm:gap-2 pb-3 sm:pb-4 border-b border-border">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground">
                        {title}
                    </h2>
                    <Badge
                        variant="secondary"
                        className="rounded-md bg-primary/10 text-primary border-none px-2 py-0.5 sm:px-2.5 font-bold text-[11px] sm:text-xs shadow-none"
                    >
                        {courses.length} {courses.length === 1 ? "course" : "courses"}
                    </Badge>
                </div>
                {subtitle && (
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Course Grid - Mobile: single column, Tablet: 2 cols, Desktop: 3 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 items-stretch">
                {courses.map((course) => (
                    <CourseCard key={course.code} course={course} />
                ))}
            </div>
        </section>
    );
}
