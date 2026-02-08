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
import { BookOpen, ChevronRight, Clock } from "lucide-react";

interface CourseCardProps {
    course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
    const accordionId = useId();
    const uniqueValue = `accordion-${course.code}-${accordionId}`;

    return (
        <Card className="group relative flex flex-col overflow-hidden bg-white border border-zinc-200 rounded-xl self-start w-full">
            {/* Card Header with gradient accent */}
            <CardHeader className="relative bg-gradient-to-br from-zinc-50 to-white pb-4 px-4 sm:px-5 pt-4 sm:pt-5 border-b border-zinc-100">
                {/* Course Code & Credits Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge className="font-inter text-[11px] sm:text-xs font-bold tracking-wide bg-primary text-white hover:bg-primary/90 border-none px-2.5 py-1 rounded-md uppercase shadow-sm">
                        {course.code}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">
                            {course.credits} {course.credits !== 1 ? 'Credits' : 'Credit'}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <CardTitle className="text-base sm:text-lg font-bold leading-snug font-inter text-zinc-800 line-clamp-2">
                    {course.title}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col px-4 sm:px-5 py-4 gap-4 flex-1">
                {/* Prerequisites Section */}
                <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-[11px] sm:text-xs font-bold text-zinc-600 uppercase tracking-wide">
                            Prerequisites
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {course.prerequisites.length > 0 && course.prerequisites[0] !== "Nil" ? (
                            course.prerequisites.map((prereq, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="font-inter text-[10px] sm:text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border-zinc-300 px-2 py-0.5 rounded-md transition-colors"
                                >
                                    {prereq}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-zinc-400 italic">
                                None required
                            </span>
                        )}
                    </div>
                </div>

                {/* Topics Accordion */}
                {course.topics && course.topics.length > 0 && (
                    <div className="mt-auto pt-3 border-t border-dashed border-zinc-200">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value={uniqueValue} className="border-none">
                                <AccordionTrigger className="min-h-[36px] py-1.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-primary hover:no-underline transition-all duration-200">
                                    <span className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                                        <span>Course Topics</span>
                                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 rounded bg-zinc-200 text-zinc-700 font-bold">
                                            {course.topics.length}
                                        </Badge>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-0">
                                    <ul className="space-y-2 pl-1">
                                        {course.topics.map((topic, index) => (
                                            <li key={index} className="text-xs sm:text-sm text-zinc-600 flex items-start gap-2.5 leading-relaxed">
                                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0 mt-1.5" />
                                                <span className="flex-1">{topic}</span>
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
