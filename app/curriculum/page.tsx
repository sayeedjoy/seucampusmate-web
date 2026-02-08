import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { createPageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import curriculumData from './semester-wise.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = createPageMetadata('curriculum');

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

export default function CurriculumPage() {
  const curriculum = curriculumData as CurriculumData;

  return (
    <div className="min-h-screen bg-background">
      <Container className="pt-16 md:pt-20 lg:pt-24 pb-16 text-foreground font-inter">
          <div className="space-y-8 sm:space-y-10">
            {/* Hero Section */}
            <div className="text-center space-y-5 max-w-3xl mx-auto px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Course Curriculum
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                {curriculum.program}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-muted border border-border">
                  <span className="text-sm text-muted-foreground">Semesters:</span>
                  <span className="font-semibold text-foreground">{curriculum.total_semesters}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-muted border border-border">
                  <span className="text-sm text-muted-foreground">Total Credits:</span>
                  <span className="font-semibold text-foreground">{curriculum.total_credits}</span>
                </div>
              </div>
            </div>

            {/* Semester Accordion */}
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
                {curriculum.semesters.map((semester) => (
                  <AccordionItem
                    key={semester.semester}
                    value={`semester-${semester.semester}`}
                    className="border border-border rounded-xl px-4 sm:px-5 md:px-6 bg-card animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <AccordionTrigger className="hover:no-underline py-4 sm:py-5">
                      <div className="flex flex-1 items-center justify-between pr-2 sm:pr-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted text-foreground text-sm font-semibold">
                            {semester.semester}
                          </span>
                          <span className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
                            Semester {semester.semester}
                          </span>
                        </div>
                        <Badge variant="secondary" className="ml-2 font-medium bg-primary/10 text-primary border-none text-xs sm:text-sm px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md">
                          {semester.total_credits} Credits
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 sm:pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                        {semester.courses.map((course, index) => (
                          <div
                            key={`${course.code}-${index}`}
                            className="p-4 sm:p-5 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-colors"
                          >
                            {/* Course Header */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <Badge className="font-inter text-[11px] sm:text-xs font-semibold tracking-wide bg-primary text-white hover:bg-primary/90 border-none px-2.5 py-1 rounded-md uppercase">
                                {course.code}
                              </Badge>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">
                                  {course.credits} {course.credits !== 1 ? 'Credits' : 'Credit'}
                                </span>
                              </div>
                            </div>

                            {/* Course Title */}
                            <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base leading-snug">
                              {course.title}
                            </h3>

                            {/* Prerequisites */}
                            <div className="pt-3 border-t border-dashed border-border">
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase">
                                  Prerequisite
                                </span>
                              </div>
                              {course.prerequisite === 'Nil' || course.prerequisite === 'Varies' ? (
                                <span className="text-xs text-muted-foreground italic">None required</span>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="font-inter text-[10px] sm:text-xs font-medium text-muted-foreground bg-muted hover:bg-muted/80 border-border px-2 py-0.5 rounded-md"
                                >
                                  {course.prerequisite}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Catalog Link Button */}
            <div className="max-w-4xl mx-auto flex justify-end">
              <Button asChild size="sm" className="rounded-lg group bg-primary hover:bg-primary/90 text-white border-none px-4 py-2">
                <Link href="/course-catalog" className="flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-xs">Course Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Footnote */}
            <div className="max-w-4xl mx-auto pt-6 border-t border-border text-center">
              <p className="text-xs text-zinc-400 italic">
                Note: This data is collected from COURSE CURRICULUM OF Department of Computer Science and Engineering (CSE) PDF
              </p>
            </div>
          </div>
        </Container>
    </div>
  );
}
