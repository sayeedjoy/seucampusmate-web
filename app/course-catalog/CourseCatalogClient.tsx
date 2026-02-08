"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Header } from "@/components/navbar/header";
import { Footer } from "@/components/footer";
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Search, X, Filter } from "lucide-react";
import { CourseSection } from "@/components/course-catalog/CourseSection";
import { type Course, type CatalogData } from "./types";

// Tabs configuration
const TABS = [
    { id: "all", label: "All" },
    { id: "core", label: "Core" },
    { id: "electives-a", label: "Elective Group A" },
    { id: "electives-b", label: "Elective Group B" },
] as const;

interface CourseCatalogClientProps {
    data: CatalogData;
}

export function CourseCatalogClient({ data }: CourseCatalogClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");

    // Helper to filter courses
    const filterCourses = (courses: Course[]) => {
        return courses.filter((course) => {
            const query = searchQuery.toLowerCase();
            return (
                course.code.toLowerCase().includes(query) ||
                course.title.toLowerCase().includes(query)
            );
        });
    };

    // Get filtered lists
    const filteredCore = useMemo(() => filterCourses(data.course_catalog), [searchQuery, data.course_catalog]);
    const filteredElectivesA = useMemo(() => filterCourses(data.electives.group_A_without_lab), [searchQuery, data.electives.group_A_without_lab]);
    const filteredElectivesB = useMemo(() => filterCourses(data.electives.group_B_with_lab), [searchQuery, data.electives.group_B_with_lab]);

    // Total course counts
    const totalCourses = data.course_catalog.length + data.electives.group_A_without_lab.length + data.electives.group_B_with_lab.length;
    const totalFilteredCourses = filteredCore.length + filteredElectivesA.length + filteredElectivesB.length;

    // Decide what to show based on tabs and search results
    const showCore = activeTab === "all" || activeTab === "core";
    const showElectivesA = activeTab === "all" || activeTab === "electives-a";
    const showElectivesB = activeTab === "all" || activeTab === "electives-b";

    const hasNoResults = !filteredCore.length && !filteredElectivesA.length && !filteredElectivesB.length;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-white">
                <Container className="pt-16 md:pt-20 lg:pt-24 pb-16 text-zinc-900 font-inter">
                    <div className="space-y-8 sm:space-y-10">
                        {/* Hero Header */}
                        <div className="text-center space-y-5 max-w-3xl mx-auto px-4">

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
                                Course Catalog
                            </h1>

                            <p className="text-base sm:text-lg text-zinc-600 max-w-xl mx-auto leading-relaxed">
                                Explore <strong className="text-zinc-800">{totalCourses}</strong> courses across core subjects and electives. Find prerequisites, credits, and detailed topics.
                            </p>

                            {/* Search Bar */}
                            <div className="max-w-lg mx-auto mt-6">
                                <InputGroup className="shadow-sm border-zinc-200">
                                    <InputGroupInput
                                        type="search"
                                        aria-label="Search courses"
                                        placeholder="Search courses (e.g., CSE141, Database)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="text-sm sm:text-base"
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <Kbd className="hidden sm:inline-flex">/</Kbd>
                                    </InputGroupAddon>
                                </InputGroup>

                                {/* Search Results Count */}
                                {searchQuery && (
                                    <p className="text-sm text-zinc-500 mt-3 text-center">
                                        Found <strong className="text-primary">{totalFilteredCourses}</strong> of {totalCourses} courses
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex justify-center px-4">
                            <div className="inline-flex items-center gap-1 p-1 bg-zinc-100 rounded-xl shadow-inner">
                                <Filter className="h-4 w-4 text-zinc-500 mx-2 hidden sm:block" />
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                            ? "bg-white text-primary shadow-md"
                                            : "text-zinc-600 hover:text-zinc-900 hover:bg-white/50"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-12 sm:space-y-16">
                            {showCore && filteredCore.length > 0 && (
                                <CourseSection title="Core Courses" courses={filteredCore} />
                            )}

                            {showElectivesA && filteredElectivesA.length > 0 && (
                                <CourseSection
                                    title="Electives Group A (Theory)"
                                    subtitle="Specialized theoretical tracks without laboratory components"
                                    courses={filteredElectivesA}
                                />
                            )}

                            {showElectivesB && filteredElectivesB.length > 0 && (
                                <CourseSection
                                    title="Electives Group B (With Lab)"
                                    subtitle="Practical-heavy specializations including laboratory work"
                                    courses={filteredElectivesB}
                                />
                            )}

                            {hasNoResults && (
                                <div className="text-center py-16 sm:py-20">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 mb-4">
                                        <Search className="h-7 w-7 text-zinc-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-800">
                                        No courses found
                                    </h3>
                                    <p className="text-zinc-500 mt-1 text-sm">
                                        No results for "{searchQuery}"
                                    </p>
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
