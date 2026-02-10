"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  RotateCcw,
  User,
  Link2,
  Wrench,
  Trophy,
  GraduationCap,
  FolderKanban,
  Briefcase,
  Award,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { A4_W_PX_AT_96, A4_H_PX_AT_96 } from "@/lib/resume/constants";
import { useResumeData } from "@/hooks/resume/useResumeData";
import { useResumePdf } from "@/hooks/resume/useResumePdf";
import { ResumeSheet } from "./ResumeSheet";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { SocialLinksSection } from "./SocialLinksSection";
import { SkillsSection } from "./SkillsSection";
import { AchievementsSection } from "./AchievementsSection";
import { EducationSection } from "./EducationSection";
import { ProjectsSection } from "./ProjectsSection";
import { ExperienceSection } from "./ExperienceSection";
import { CertificationsSection } from "./CertificationsSection";

/* ── Tab / section definitions ───────────────────────────── */
const SECTIONS = [
  { value: "personal", label: "Personal", icon: User },
  { value: "links", label: "Links", icon: Link2 },
  { value: "skills", label: "Skills", icon: Wrench },
  { value: "achievements", label: "Achievements", icon: Trophy },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "projects", label: "Projects", icon: FolderKanban },
  { value: "experience", label: "Experience", icon: Briefcase },
  { value: "certifications", label: "Certs", icon: Award },
] as const;

export default function ResumeBuilder() {
  const {
    data,
    hydrated,
    onField,
    updateArrayItem,
    removeArrayItem,
    addArrayItem,
    resetAll,
    uid,
  } = useResumeData();

  const previewOuterRef = useRef<HTMLDivElement>(null);
  const printRootRef = useRef<HTMLDivElement>(null);
  const { downloadPDF, isGenerating } = useResumePdf(printRootRef, data);

  const [scale, setScale] = useState(1);
  const [isWide, setIsWide] = useState(false);

  /* Switch layout at lg (1024px) instead of xl */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsWide(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Scale preview to fit container */
  useEffect(() => {
    const computeScale = () => {
      const container = previewOuterRef.current;
      const containerWidth = container?.clientWidth ?? window.innerWidth;
      const padding = 16 * 2;
      const available = Math.max(0, containerWidth - padding);
      const s = Math.min(1, available / A4_W_PX_AT_96);
      setScale(s);
    };
    const raf = requestAnimationFrame(computeScale);
    window.addEventListener("resize", computeScale);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", computeScale);
    };
  }, []);

  const previewHeightPx = useMemo(() => {
    const scaled = Math.round(A4_H_PX_AT_96 * scale + 24);
    return Math.max(560, scaled);
  }, [scale]);

  /* ── Shared section content renderer ────────────────────── */
  const renderSectionContent = (section: string) => {
    switch (section) {
      case "personal":
        return (
          <PersonalInfoSection
            name={data.name}
            title={data.title}
            email={data.email}
            phone={data.phone}
            location={data.location}
            summary={data.summary}
            onField={onField}
          />
        );
      case "links":
        return (
          <SocialLinksSection
            links={data.links}
            onAdd={() =>
              addArrayItem("links", { id: uid(), platform: "", url: "" })
            }
            onUpdate={(id, patch) => updateArrayItem("links", id, patch)}
            onRemove={(id) => removeArrayItem("links", id)}
          />
        );
      case "skills":
        return (
          <SkillsSection
            technicalSkills={data.technicalSkills}
            softSkills={data.softSkills}
            languages={data.languages}
            onField={onField}
          />
        );
      case "achievements":
        return (
          <AchievementsSection
            achievements={data.achievements}
            onAdd={() =>
              addArrayItem("achievements", { id: uid(), text: "" })
            }
            onUpdate={(id, patch) =>
              updateArrayItem("achievements", id, patch)
            }
            onRemove={(id) => removeArrayItem("achievements", id)}
          />
        );
      case "education":
        return (
          <EducationSection
            education={data.education}
            onAdd={() =>
              addArrayItem("education", {
                id: uid(),
                institute: "",
                degree: "",
                year: "",
              })
            }
            onUpdate={(id, patch) => updateArrayItem("education", id, patch)}
            onRemove={(id) => removeArrayItem("education", id)}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            projects={data.projects}
            onAdd={() =>
              addArrayItem("projects", {
                id: uid(),
                name: "",
                description: "",
                link: "",
                tools: "",
              })
            }
            onUpdate={(id, patch) => updateArrayItem("projects", id, patch)}
            onRemove={(id) => removeArrayItem("projects", id)}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            experience={data.experience}
            onAdd={() =>
              addArrayItem("experience", {
                id: uid(),
                org: "",
                role: "",
                duration: "",
                details: "",
              })
            }
            onUpdate={(id, patch) => updateArrayItem("experience", id, patch)}
            onRemove={(id) => removeArrayItem("experience", id)}
          />
        );
      case "certifications":
        return (
          <CertificationsSection
            certifications={data.certifications}
            onAdd={() =>
              addArrayItem("certifications", { id: uid(), text: "" })
            }
            onUpdate={(id, patch) =>
              updateArrayItem("certifications", id, patch)
            }
            onRemove={(id) => removeArrayItem("certifications", id)}
          />
        );
      default:
        return null;
    }
  };

  if (!hydrated) return null;

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-400 space-y-4 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ── Header bar ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0 space-y-0.5">
            <h1 className="text-xl font-bold text-primary sm:text-2xl">
              Resume Builder
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Build a professional, ATS-friendly resume instantly.
            </p>
          </div>

          <Separator
            orientation="vertical"
            className="hidden sm:block sm:h-10"
          />

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all resume fields and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={resetAll}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              size="sm"
              onClick={downloadPDF}
              disabled={isGenerating}
              className="min-w-0 flex-1 sm:min-w-40 sm:flex-none"
            >
              <Download className="mr-1.5 h-4 w-4" />
              {isGenerating ? "Processing…" : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* ── Main 2-panel layout ────────────────────────────── */}
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-6">
          {/* ── Form panel ── */}
          <div className="order-2 min-w-0 lg:order-1">
            {isWide ? (
              /* ── Desktop: Tabs navigation ── */
              <div
                className="flex flex-col overflow-hidden rounded-xl border bg-card"
                style={{ height: previewHeightPx, maxHeight: previewHeightPx }}
              >
                <Tabs
                  defaultValue="personal"
                  className="flex h-full flex-col gap-0"
                >
                  <div className="shrink-0 border-b bg-muted/30 px-2 pt-2">
                    <TabsList
                      variant="line"
                      className="h-auto w-full flex-wrap justify-start gap-0"
                    >
                      {SECTIONS.map((s) => (
                        <TabsTrigger
                          key={s.value}
                          value={s.value}
                          className="gap-1.5 px-3 py-2 text-xs xl:text-sm"
                        >
                          <s.icon className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{s.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto scroll-smooth p-4 [scrollbar-width:thin]">
                    {SECTIONS.map((s) => (
                      <TabsContent
                        key={s.value}
                        value={s.value}
                        className="mt-0 focus-visible:ring-0"
                      >
                        {renderSectionContent(s.value)}
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              </div>
            ) : (
              /* ── Mobile / Tablet: Accordion navigation ── */
              <div className="space-y-3">
                <Accordion
                  type="multiple"
                  defaultValue={["personal"]}
                  className="w-full"
                >
                  {SECTIONS.map((s) => (
                    <AccordionItem key={s.value} value={s.value}>
                      <AccordionTrigger className="gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          <s.icon className="h-4 w-4 text-muted-foreground" />
                          {s.label === "Certs" ? "Certifications" : s.label}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        {renderSectionContent(s.value)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>

          {/* ── Preview panel ── */}
          <div
            ref={previewOuterRef}
            className="order-1 min-w-0 overflow-hidden rounded-xl border bg-muted/40 p-2 sm:p-3 lg:order-2 lg:w-[min(100%,840px)]"
          >
            <div className="flex justify-center">
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                }}
              >
                <div className="shadow-lg" style={{ background: "#fff" }}>
                  <ResumeSheet data={data} rootId="resume-preview-root" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Off-screen print root for PDF generation ──────── */}
        <div
          style={{
            position: "fixed",
            left: "-2400px",
            top: "0px",
            width: `${A4_W_PX_AT_96}px`,
            background: "#fff",
            zIndex: -1,
          }}
        >
          <div ref={printRootRef}>
            <ResumeSheet data={data} rootId="resume-print-root" />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
