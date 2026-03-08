"use client";

import { useId } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { type Course } from "@/app/course-catalog/types";
import { BookOpen, ChevronRight, Clock, ListChecks } from "lucide-react";

interface CourseCardProps {
    course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
    const accordionId = useId();
    const uniqueValue = `accordion-${course.code}-${accordionId}`;
    const hasPrereqs =
        course.prerequisites.length > 0 && course.prerequisites[0] !== "Nil";
    const hasTopics = course.topics && course.topics.length > 0;

    return (
        <Card className="group relative flex flex-col overflow-hidden bg-card border border-border rounded-xl self-start w-full transition-shadow hover:shadow-md">
            {/* Card Header */}
            <CardHeader className="relative bg-gradient-to-br from-muted/50 to-card px-3.5 pt-3.5 pb-3 sm:px-5 sm:pt-4 sm:pb-3.5 border-b border-border">
                {/* Course Code & Credits */}
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                    <Badge className="text-[11px] font-bold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 border-none px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md uppercase shadow-sm">
                        {course.code}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                            {course.credits}{" "}
                            {course.credits !== 1 ? "Credits" : "Credit"}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <CardTitle className="text-sm sm:text-base font-bold leading-snug text-foreground line-clamp-2">
                    {course.title}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col px-3.5 sm:px-5 py-3 sm:py-4 gap-3 sm:gap-4 flex-1">
                {/* Prerequisites - compact on mobile */}
                <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                            Prerequisites
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {hasPrereqs ? (
                            course.prerequisites.map((prereq, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-[10px] sm:text-xs font-medium text-foreground bg-muted hover:bg-muted/80 border-border px-1.5 sm:px-2 py-0 sm:py-0.5 rounded-md transition-colors"
                                >
                                    {prereq}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-[11px] sm:text-xs text-muted-foreground italic">
                                None required
                            </span>
                        )}
                    </div>
                </div>

                {/* Topics Accordion */}
                {hasTopics && (
                    <div className="mt-auto pt-2.5 sm:pt-3 border-t border-dashed border-border">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                        >
                            <AccordionItem
                                value={uniqueValue}
                                className="border-none"
                            >
                                <AccordionTrigger className="min-h-[44px] py-1.5 text-xs sm:text-sm font-semibold text-foreground hover:text-primary hover:no-underline transition-all duration-200 touch-manipulation">
                                    <span className="flex items-center gap-1.5 sm:gap-2">
                                        <ListChecks className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                        <span>Course Topics</span>
                                        <Badge
                                            variant="secondary"
                                            className="ml-0.5 sm:ml-1 text-[10px] px-1.5 py-0 rounded bg-muted text-foreground font-bold"
                                        >
                                            {course.topics!.length}
                                        </Badge>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pt-1.5 sm:pt-2 pb-0">
                                    <ul className="space-y-1.5 sm:space-y-2 pl-0.5 sm:pl-1">
                                        {course.topics!.map((topic, index) => (
                                            <li
                                                key={index}
                                                className="text-[11px] sm:text-xs text-muted-foreground flex items-start gap-2 leading-relaxed"
                                            >
                                                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-muted-foreground/60 shrink-0 mt-1.5" />
                                                <span className="flex-1">
                                                    {topic}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
