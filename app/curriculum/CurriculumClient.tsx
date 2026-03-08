"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    X,
    BookOpen,
    Clock,
    GraduationCap,
    Layers,
    ArrowRight,
    Calendar,
    Hash,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Course {
    code: string;
    title: string;
    credits: number;
    prerequisite: string;
}

interface Semester {
    semester: number;
    total_credits: number;
    courses: Course[];
}

interface CurriculumData {
    program: string;
    total_semesters: number;
    total_credits: number;
    semesters: Semester[];
}

interface CurriculumClientProps {
    curriculum: CurriculumData;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getYearLabel(semester: number): string {
    if (semester <= 3) return "1st Year";
    if (semester <= 6) return "2nd Year";
    if (semester <= 9) return "3rd Year";
    return "4th Year";
}

const FILTER_OPTIONS = [
    { value: "all", label: "All Semesters" },
    { value: "year-1", label: "1st Year (Sem 1–3)" },
    { value: "year-2", label: "2nd Year (Sem 4–6)" },
    { value: "year-3", label: "3rd Year (Sem 7–9)" },
    { value: "year-4", label: "4th Year (Sem 10–12)" },
] as const;

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function CurriculumClient({ curriculum }: CurriculumClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [yearFilter, setYearFilter] = useState<string>("all");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut: "/" to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "/" &&
                !["INPUT", "TEXTAREA", "SELECT"].includes(
                    (e.target as HTMLElement)?.tagName
                )
            ) {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === "Escape" && isSearchFocused) {
                searchRef.current?.blur();
                setIsSearchFocused(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearchFocused]);

    // Filter semesters by year (3 semesters per year)
    const yearFilteredSemesters = useMemo(() => {
        if (yearFilter === "all") return curriculum.semesters;
        const yearNum = parseInt(yearFilter.replace("year-", ""));
        const start = (yearNum - 1) * 3 + 1;
        const end = yearNum * 3;
        return curriculum.semesters.filter(
            (s) => s.semester >= start && s.semester <= end
        );
    }, [yearFilter, curriculum.semesters]);

    // Filter by search query
    const filteredSemesters = useMemo(() => {
        if (!searchQuery.trim()) return yearFilteredSemesters;
        const query = searchQuery.toLowerCase().trim();
        return yearFilteredSemesters
            .map((semester) => ({
                ...semester,
                courses: semester.courses.filter(
                    (c) =>
                        c.code.toLowerCase().includes(query) ||
                        c.title.toLowerCase().includes(query) ||
                        c.prerequisite.toLowerCase().includes(query)
                ),
            }))
            .filter((s) => s.courses.length > 0);
    }, [searchQuery, yearFilteredSemesters]);

    const totalCourses = curriculum.semesters.reduce(
        (acc, s) => acc + s.courses.length,
        0
    );
    const filteredCourseCount = filteredSemesters.reduce(
        (acc, s) => acc + s.courses.length,
        0
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/40 to-background">
                <Container className="pt-20 pb-6 sm:pt-24 sm:pb-8 md:pt-28 md:pb-10">
                    <div className="mx-auto max-w-2xl text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>{curriculum.program}</span>
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Course Curriculum
                        </h1>

                        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Complete semester-wise breakdown of your degree
                            program. Browse courses, prerequisites, and credit
                            distribution.
                        </p>

                        {/* Stats pills */}
                        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 pt-2">
                            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 sm:px-4 sm:py-2">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground text-xs sm:text-sm">
                                    Semesters
                                </span>
                                <span className="font-bold text-foreground tabular-nums text-xs sm:text-sm">
                                    {curriculum.total_semesters}
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 sm:px-4 sm:py-2">
                                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground text-xs sm:text-sm">
                                    Credits
                                </span>
                                <span className="font-bold text-foreground tabular-nums text-xs sm:text-sm">
                                    {curriculum.total_credits}
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 sm:px-4 sm:py-2">
                                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground text-xs sm:text-sm">
                                    Courses
                                </span>
                                <span className="font-bold text-foreground tabular-nums text-xs sm:text-sm">
                                    {totalCourses}
                                </span>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Sticky Search & Filter Bar */}
            <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <Container className="py-3 sm:py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchRef}
                                type="search"
                                aria-label="Search courses"
                                placeholder="Search by code, title, or prerequisite..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="h-10 pl-9 pr-16 text-sm rounded-lg sm:h-9"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSearchQuery("")}
                                        className="h-6 w-6 rounded-md"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                                <kbd className="pointer-events-none hidden h-5 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
                                    /
                                </kbd>
                            </div>
                        </div>

                        {/* Year Filter */}
                        <div className="shrink-0">
                            <Select
                                value={yearFilter}
                                onValueChange={setYearFilter}
                            >
                                <SelectTrigger className="h-10 w-full sm:w-[200px] text-sm rounded-lg sm:h-9">
                                    <SelectValue placeholder="Filter by year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FILTER_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Search summary */}
                    {searchQuery && (
                        <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <Search className="h-3 w-3 shrink-0" />
                            <span>
                                Found{" "}
                                <span className="font-semibold text-foreground tabular-nums">
                                    {filteredCourseCount}
                                </span>{" "}
                                courses matching &ldquo;
                                <span className="font-medium text-foreground">
                                    {searchQuery}
                                </span>
                                &rdquo;
                            </span>
                        </div>
                    )}
                </Container>
            </div>

            {/* Semester Grid */}
            <Container className="py-6 sm:py-8 md:py-10">
                {filteredSemesters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                        {filteredSemesters.map((semester) => (
                            <SemesterCard
                                key={semester.semester}
                                semester={semester}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted sm:h-16 sm:w-16">
                            <Search className="h-6 w-6 text-muted-foreground sm:h-7 sm:w-7" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
                            No courses found
                        </h3>
                        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                            No results for &ldquo;{searchQuery}&rdquo;. Try a
                            different search term or filter.
                        </p>
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery("");
                                    setYearFilter("all");
                                }}
                                className="gap-1.5"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear filters
                            </Button>
                        </div>
                    </div>
                )}

                {/* Bottom actions */}
                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                    <p className="text-[11px] sm:text-xs text-muted-foreground italic text-center sm:text-left">
                        Data sourced from the official CSE Department Course
                        Curriculum PDF.
                    </p>
                    <Button
                        asChild
                        size="sm"
                        className="rounded-lg group gap-2 shrink-0"
                    >
                        <Link href="/course-catalog">
                            <span className="text-xs font-semibold">
                                Explore Course Catalog
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </Button>
                </div>
            </Container>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Semester Card                                                      */
/* ------------------------------------------------------------------ */

function SemesterCard({ semester }: { semester: Semester }) {
    return (
        <Card className="flex flex-col overflow-hidden border border-border rounded-xl transition-shadow hover:shadow-md">
            {/* Semester header */}
            <CardHeader className="bg-gradient-to-br from-muted/50 to-card border-b border-border px-3.5 pt-3.5 pb-3 sm:px-4 sm:pt-4 sm:pb-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold tabular-nums">
                            {semester.semester}
                        </span>
                        <div className="flex flex-col">
                            <CardTitle className="text-sm sm:text-base font-bold text-foreground leading-tight">
                                Semester {semester.semester}
                            </CardTitle>
                            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                                {getYearLabel(semester.semester)}
                            </span>
                        </div>
                    </div>
                    <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-none text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums"
                    >
                        {semester.total_credits} cr
                    </Badge>
                </div>
            </CardHeader>

            {/* Courses list via accordion */}
            <CardContent className="flex-1 px-3 sm:px-3.5 py-2 sm:py-2.5">
                <Accordion type="multiple" className="w-full">
                    {semester.courses.map((course, idx) => (
                        <AccordionItem
                            key={`${course.code}-${idx}`}
                            value={`${course.code}-${idx}`}
                            className="border-b border-border last:border-b-0"
                        >
                            <AccordionTrigger className="min-h-[44px] py-2 hover:no-underline touch-manipulation">
                                <div className="flex flex-1 items-center justify-between gap-2 pr-1 text-left overflow-hidden">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Badge className="shrink-0 max-w-[100px] sm:max-w-[120px] truncate text-[9px] sm:text-[10px] font-bold tracking-wide bg-primary text-primary-foreground border-none px-1.5 py-0 sm:px-2 rounded uppercase">
                                            {course.code}
                                        </Badge>
                                        <span className="text-[11px] sm:text-xs font-medium text-foreground line-clamp-2">
                                            {course.title}
                                        </span>
                                    </div>
                                    <span className="shrink-0 text-[10px] font-semibold text-muted-foreground tabular-nums">
                                        {course.credits}cr
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-2.5 pt-0">
                                <div className="rounded-lg bg-muted/50 border border-border p-2.5 sm:p-3 space-y-2">
                                    {/* Full title */}
                                    <h4 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                                        {course.title}
                                    </h4>

                                    {/* Credits + Prerequisite */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                                                {course.credits}{" "}
                                                {course.credits !== 1
                                                    ? "Credits"
                                                    : "Credit"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                                                Prereq:{" "}
                                                {course.prerequisite ===
                                                    "Nil" ||
                                                course.prerequisite ===
                                                    "Varies" ? (
                                                    <span className="italic">
                                                        None
                                                    </span>
                                                ) : (
                                                    <span className="font-medium text-foreground break-all">
                                                        {course.prerequisite}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
