"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    GraduationCap,
    FlaskConical,
    Layers,
} from "lucide-react";
import { CourseSection } from "@/components/course-catalog/course-section";
import { type Course, type CatalogData } from "./types";

const CATEGORIES = [
    {
        id: "core",
        label: "Core Courses",
        shortLabel: "Core",
        icon: BookOpen,
    },
    {
        id: "electives-a",
        label: "Elective Group A",
        shortLabel: "Elective A",
        icon: GraduationCap,
    },
    {
        id: "electives-b",
        label: "Elective Group B",
        shortLabel: "Elective B",
        icon: FlaskConical,
    },
] as const;

interface CourseCatalogClientProps {
    data: CatalogData;
}

export function CourseCatalogClient({ data }: CourseCatalogClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("core");
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

    // Filter courses by search query (also searches topics)
    const filterCourses = useCallback(
        (courses: Course[]) => {
            if (!searchQuery.trim()) return courses;
            const query = searchQuery.toLowerCase().trim();
            return courses.filter(
                (course) =>
                    course.code.toLowerCase().includes(query) ||
                    course.title.toLowerCase().includes(query) ||
                    course.topics?.some((t) =>
                        t.toLowerCase().includes(query)
                    )
            );
        },
        [searchQuery]
    );

    // Filtered course lists
    const filteredCore = useMemo(
        () => filterCourses(data.course_catalog),
        [filterCourses, data.course_catalog]
    );
    const filteredElectivesA = useMemo(
        () => filterCourses(data.electives.group_A_without_lab),
        [filterCourses, data.electives.group_A_without_lab]
    );
    const filteredElectivesB = useMemo(
        () => filterCourses(data.electives.group_B_with_lab),
        [filterCourses, data.electives.group_B_with_lab]
    );

    // Counts
    const totalCourses =
        data.course_catalog.length +
        data.electives.group_A_without_lab.length +
        data.electives.group_B_with_lab.length;

    const categoryCountMap: Record<string, number> = {
        core: filteredCore.length,
        "electives-a": filteredElectivesA.length,
        "electives-b": filteredElectivesB.length,
    };

    const activeCourses =
        activeCategory === "core"
            ? filteredCore
            : activeCategory === "electives-a"
              ? filteredElectivesA
              : filteredElectivesB;

    const activeSectionTitle =
        activeCategory === "core"
            ? "Core Courses"
            : activeCategory === "electives-a"
              ? "Electives Group A (Theory)"
              : "Electives Group B (With Lab)";

    const activeSectionSubtitle =
        activeCategory === "core"
            ? undefined
            : activeCategory === "electives-a"
              ? "Specialized theoretical tracks without laboratory components"
              : "Practical-heavy specializations including laboratory work";

    const totalFilteredCourses =
        filteredCore.length +
        filteredElectivesA.length +
        filteredElectivesB.length;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/40 to-background">
                <Container className="pt-20 pb-6 sm:pt-24 sm:pb-8 md:pt-28 md:pb-10">
                    <div className="mx-auto max-w-2xl text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                            <Layers className="h-3.5 w-3.5" />
                            <span>{totalCourses} courses available</span>
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Course Catalog
                        </h1>

                        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Explore courses across core subjects and elective
                            groups. Find prerequisites, credit hours, and
                            detailed topics for every course.
                        </p>
                    </div>
                </Container>
            </div>

            {/* Sticky Search & Filter Bar */}
            <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <Container className="py-3 sm:py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchRef}
                                type="search"
                                aria-label="Search courses"
                                placeholder="Search by code, title, or topic..."
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

                        {/* Mobile: Select dropdown filter */}
                        <div className="sm:hidden">
                            <Select
                                value={activeCategory}
                                onValueChange={setActiveCategory}
                            >
                                <SelectTrigger className="h-10 w-full text-sm rounded-lg">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id}
                                        >
                                            <span className="flex items-center gap-2">
                                                <cat.icon className="h-4 w-4 text-muted-foreground" />
                                                <span>{cat.label}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1 text-[10px] tabular-nums"
                                                >
                                                    {categoryCountMap[cat.id]}
                                                </Badge>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Desktop: Tabs filter */}
                        <div className="hidden sm:block shrink-0">
                            <Tabs
                                value={activeCategory}
                                onValueChange={setActiveCategory}
                            >
                                <TabsList variant="default" className="h-9">
                                    {CATEGORIES.map((cat) => (
                                        <TabsTrigger
                                            key={cat.id}
                                            value={cat.id}
                                            className="gap-1.5 px-3 text-xs font-semibold cursor-pointer"
                                        >
                                            <cat.icon className="h-3.5 w-3.5" />
                                            <span className="hidden md:inline">
                                                {cat.shortLabel}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="ml-0.5 h-4 px-1 text-[10px] tabular-nums"
                                            >
                                                {categoryCountMap[cat.id]}
                                            </Badge>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    {/* Search results summary */}
                    {searchQuery && (
                        <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <Search className="h-3 w-3 shrink-0" />
                            <span>
                                Found{" "}
                                <span className="font-semibold text-foreground tabular-nums">
                                    {totalFilteredCourses}
                                </span>{" "}
                                of {totalCourses} courses matching &ldquo;
                                <span className="font-medium text-foreground">
                                    {searchQuery}
                                </span>
                                &rdquo;
                            </span>
                        </div>
                    )}
                </Container>
            </div>

            {/* Course Content */}
            <Container className="py-6 sm:py-8 md:py-10">
                {activeCourses.length > 0 ? (
                    <CourseSection
                        title={activeSectionTitle}
                        subtitle={activeSectionSubtitle}
                        courses={activeCourses}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted sm:h-16 sm:w-16">
                            <Search className="h-6 w-6 text-muted-foreground sm:h-7 sm:w-7" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
                            No courses found
                        </h3>
                        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                            No results for &ldquo;{searchQuery}&rdquo; in{" "}
                            {CATEGORIES.find((c) => c.id === activeCategory)
                                ?.label ?? "this category"}
                            . Try a different search term or category.
                        </p>
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="gap-1.5"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear search
                            </Button>
                            {activeCategory !== "core" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveCategory("core")}
                                    className="gap-1.5"
                                >
                                    <BookOpen className="h-3.5 w-3.5" />
                                    View Core Courses
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}
