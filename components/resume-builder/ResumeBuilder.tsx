"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

  useEffect(() => {
    const updateWide = () => setIsWide(window.innerWidth >= 1280);
    updateWide();
    window.addEventListener("resize", updateWide);
    return () => window.removeEventListener("resize", updateWide);
  }, []);

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

  if (!hydrated) return null;

  return (
    <TooltipProvider>
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">Resume Builder</h1>
            <p className="text-sm text-muted-foreground">
              Build a professional, ATS-friendly resume instantly.
            </p>
          </div>
          <Separator orientation="vertical" className="hidden md:block md:h-10" />
          <div className="flex flex-wrap items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
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
                  <AlertDialogAction
                    variant="destructive"
                    onClick={resetAll}
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              size="sm"
              onClick={downloadPDF}
              disabled={isGenerating}
              className="min-w-[160px]"
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Processing..." : "Download PDF"}
            </Button>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
          <div className="order-2 min-w-0 space-y-6 xl:order-1">
            <div
              className="space-y-6 overflow-y-auto pr-1"
              style={
                isWide
                  ? { height: previewHeightPx, maxHeight: previewHeightPx }
                  : undefined
              }
            >
              <Accordion type="multiple" defaultValue={["personal"]} className="w-full">
                <AccordionItem value="personal">
                  <AccordionTrigger>Personal Info</AccordionTrigger>
                  <AccordionContent>
                    <PersonalInfoSection
                      name={data.name}
                      title={data.title}
                      email={data.email}
                      phone={data.phone}
                      location={data.location}
                      summary={data.summary}
                      onField={onField}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="links">
                  <AccordionTrigger>Social Links</AccordionTrigger>
                  <AccordionContent>
                    <SocialLinksSection
                      links={data.links}
                      onAdd={() => addArrayItem("links", { id: uid(), platform: "", url: "" })}
                      onUpdate={(id, patch) => updateArrayItem("links", id, patch)}
                      onRemove={(id) => removeArrayItem("links", id)}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="skills">
                  <AccordionTrigger>Skills</AccordionTrigger>
                  <AccordionContent>
                    <SkillsSection
                      technicalSkills={data.technicalSkills}
                      softSkills={data.softSkills}
                      languages={data.languages}
                      onField={onField}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="achievements">
                  <AccordionTrigger>Key Achievements</AccordionTrigger>
                  <AccordionContent>
                    <AchievementsSection
                      achievements={data.achievements}
                      onAdd={() => addArrayItem("achievements", { id: uid(), text: "" })}
                      onUpdate={(id, patch) => updateArrayItem("achievements", id, patch)}
                      onRemove={(id) => removeArrayItem("achievements", id)}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="education">
                  <AccordionTrigger>Education</AccordionTrigger>
                  <AccordionContent>
                    <EducationSection
                      education={data.education}
                      onAdd={() => addArrayItem("education", { id: uid(), institute: "", degree: "", year: "" })}
                      onUpdate={(id, patch) => updateArrayItem("education", id, patch)}
                      onRemove={(id) => removeArrayItem("education", id)}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="projects">
                  <AccordionTrigger>Projects / Activities</AccordionTrigger>
                  <AccordionContent>
                    <ProjectsSection
                      projects={data.projects}
                      onAdd={() => addArrayItem("projects", { id: uid(), name: "", description: "", link: "", tools: "" })}
                      onUpdate={(id, patch) => updateArrayItem("projects", id, patch)}
                      onRemove={(id) => removeArrayItem("projects", id)}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="experience">
                  <AccordionTrigger>Experience</AccordionTrigger>
                  <AccordionContent>
                    <ExperienceSection
                      experience={data.experience}
                      onAdd={() => addArrayItem("experience", { id: uid(), org: "", role: "", duration: "", details: "" })}
                      onUpdate={(id, patch) => updateArrayItem("experience", id, patch)}
                      onRemove={(id) => removeArrayItem("experience", id)}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="certifications">
                  <AccordionTrigger>Certifications</AccordionTrigger>
                  <AccordionContent>
                    <CertificationsSection
                      certifications={data.certifications}
                      onAdd={() => addArrayItem("certifications", { id: uid(), text: "" })}
                      onUpdate={(id, patch) => updateArrayItem("certifications", id, patch)}
                      onRemove={(id) => removeArrayItem("certifications", id)}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div
            ref={previewOuterRef}
            className="order-1 min-w-0 overflow-hidden rounded-xl border bg-muted/40 p-3 xl:order-2"
          >
            <div className="flex justify-center">
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
                <div style={{ background: "#fff" }}>
                  <ResumeSheet data={data} rootId="resume-preview-root" />
                </div>
              </div>
            </div>
          </div>
        </div>

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
