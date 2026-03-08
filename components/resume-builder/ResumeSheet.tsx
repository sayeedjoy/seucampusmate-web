"use client";

import React from "react";
import { Link as LinkIcon } from "lucide-react";
import type { ResumeData, LinkItem, EducationItem, ExperienceItem, ProjectItem, BulletItem } from "@/lib/resume/types";
import { A4_W_MM, A4_H_MM } from "@/lib/resume/constants";
import { hasAnyContent } from "@/lib/resume/utils";

const ghost: React.CSSProperties = {
  opacity: 0.35,
  fontStyle: "italic",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "1px",
  textTransform: "uppercase",
  borderBottom: "1px solid #000",
  paddingBottom: "4px",
  marginBottom: "6px",
};

const text: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: 1.5,
  whiteSpace: "pre-line",
};

export const ResumeSheet = React.forwardRef<
  HTMLDivElement,
  { data: ResumeData; rootId: string }
>(function ResumeSheet({ data, rootId }, ref) {
  const any = hasAnyContent(data);

  const showName = data.name.trim() || (!any ? "Kazi Azmainur Rahman" : "");
  const showTitle = data.title.trim() || (!any ? "Full Stack Developer" : "");
  const showEmail = data.email.trim() || (!any ? "yourmail@example.com" : "");
  const showPhone = data.phone.trim() || (!any ? "+880 1XXXXXXXXX" : "");
  const showLoc = data.location.trim() || (!any ? "Dhaka, Bangladesh" : "");
  const showSummary =
    data.summary.trim() ||
    (!any
      ? "Write 2–4 lines about yourself. Keep it clear and professional.\nExample: Motivated university student with strong interest in learning and teamwork..."
      : "");

  const techSkills =
    data.technicalSkills.trim() ||
    (!any ? "Example: Excel, PowerPoint, Google Workspace, Python, Flutter, MATLAB, AutoCAD" : "");
  const softSkills =
    data.softSkills.trim() ||
    (!any ? "Example: Communication, Teamwork, Problem Solving, Time Management, Adaptability" : "");
  const languages =
    data.languages.trim() ||
    (!any ? "Example: Bangla (Native), English (Professional)" : "");

  const links = data.links.filter((l) => (l.platform || l.url).trim().length > 0);
  const education = data.education.filter((e) => (e.institute || e.degree || e.year).trim().length > 0);
  const experience = data.experience.filter((x) => (x.org || x.role || x.duration || x.details).trim().length > 0);
  const projects = data.projects.filter((p) => (p.name || p.description || p.link || p.tools).trim().length > 0);
  const achievements = data.achievements.filter((b) => b.text.trim().length > 0);
  const certifications = data.certifications.filter((b) => b.text.trim().length > 0);

  const placeholderLinks: LinkItem[] = [
    { id: "g1", platform: "LinkedIn", url: "linkedin.com/in/yourname" },
    { id: "g2", platform: "Portfolio", url: "your-portfolio.com" },
  ];
  const placeholderAchievements: BulletItem[] = [
    { id: "a1", text: "Example: Organized/led events or workshops and engaged participants." },
    { id: "a2", text: "Example: Built a project, improved a process, or achieved measurable results." },
  ];
  const placeholderProject: ProjectItem = {
    id: "p1",
    name: "Example Project / Case Study / Lab Work",
    description: "Write 1–2 lines: what you did, what problem it solved, and the outcome.",
    link: "project-link.com",
    tools: "Tools/Methods: Excel, PowerPoint / MATLAB / Next.js etc.",
  };
  const placeholderExperience: ExperienceItem = {
    id: "e1",
    org: "Example Organization",
    role: "Role / Position",
    duration: "2024 - Present",
    details: "Write 1–2 lines about responsibilities and impact.",
  };
  const placeholderEducation: EducationItem = {
    id: "ed1",
    institute: "Southeast University",
    degree: "Degree / Program (e.g., BBA / EEE / CSE)",
    year: "2023 - Present",
  };
  const placeholderCert: BulletItem = { id: "c1", text: "Example: Course / Training / Competition participation." };

  return (
    <div
      id={rootId}
      ref={ref}
      style={{
        width: `${A4_W_MM}mm`,
        minHeight: `${A4_H_MM}mm`,
        padding: "15mm",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "Arial, Helvetica, sans-serif",
        WebkitFontSmoothing: "antialiased",
        textRendering: "geometricPrecision",
      }}
    >
      <header style={{ borderBottom: "2px solid #000", paddingBottom: "10mm", marginBottom: "8mm" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1.1 }}>
            <span style={!data.name.trim() ? ghost : undefined}>{showName}</span>
          </div>
          <div style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.2 }}>
            <span style={!data.title.trim() ? ghost : undefined}>{showTitle}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "11px", lineHeight: 1.2 }}>
            {showEmail ? <span style={!data.email.trim() ? ghost : undefined}>{showEmail}</span> : null}
            {showPhone ? <span style={!data.phone.trim() ? ghost : undefined}>{showPhone}</span> : null}
            {showLoc ? <span style={!data.location.trim() ? ghost : undefined}>{showLoc}</span> : null}
          </div>
          {(links.length > 0 || !any) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", lineHeight: 1.2 }}>
              {(links.length > 0 ? links : placeholderLinks).map((l) => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <LinkIcon className="h-3 w-3" />
                  <span style={{ fontWeight: 700 }}>{l.platform || "Link"}:</span>
                  <span style={{ textDecoration: "underline", ...(l.url ? undefined : ghost) }}>{l.url || "your-link"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "6mm" }}>
        <section>
          <h3 style={sectionTitle}>Summary</h3>
          <p style={{ ...text, ...(data.summary.trim() ? undefined : ghost) }}>{showSummary}</p>
        </section>

        <section>
          <h3 style={sectionTitle}>Skills</h3>
          <div style={{ display: "grid", gap: "4px", fontSize: "12px", lineHeight: 1.3 }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ width: "120px", fontWeight: 700 }}>Technical:</span>
              <span style={!data.technicalSkills.trim() ? ghost : undefined}>{techSkills}</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ width: "120px", fontWeight: 700 }}>Soft:</span>
              <span style={!data.softSkills.trim() ? ghost : undefined}>{softSkills}</span>
            </div>
          </div>
        </section>

        {(achievements.length > 0 || !any) && (
          <section>
            <h3 style={sectionTitle}>Key Achievements</h3>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", lineHeight: 1.5 }}>
              {(achievements.length > 0 ? achievements : placeholderAchievements).map((b) => (
                <li key={b.id} style={!achievements.length ? ghost : undefined}>
                  {b.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(projects.length > 0 || !any) && (
          <section>
            <h3 style={sectionTitle}>Projects / Activities</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "4mm" }}>
              {(projects.length > 0 ? projects : [placeholderProject]).map((p) => (
                <div key={p.id} style={!projects.length ? ghost : undefined}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ fontWeight: 800, fontSize: "13px" }}>{p.name}</div>
                    {p.link.trim() ? <div style={{ fontSize: "10px", textDecoration: "underline" }}>{p.link}</div> : null}
                  </div>
                  {p.tools.trim() ? <div style={{ fontSize: "10px", marginTop: "2px", fontWeight: 700 }}>{p.tools}</div> : null}
                  {p.description.trim() ? <div style={{ ...text, marginTop: "2px" }}>{p.description}</div> : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {(experience.length > 0 || !any) && (
          <section>
            <h3 style={sectionTitle}>Experience</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "4mm" }}>
              {(experience.length > 0 ? experience : [placeholderExperience]).map((x) => (
                <div key={x.id} style={!experience.length ? ghost : undefined}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ fontWeight: 800, fontSize: "13px" }}>{x.org}</div>
                    {x.duration.trim() ? <div style={{ fontSize: "11px", fontWeight: 700 }}>{x.duration}</div> : null}
                  </div>
                  {x.role.trim() ? <div style={{ fontSize: "12px", fontStyle: "italic", marginTop: "1px" }}>{x.role}</div> : null}
                  {x.details.trim() ? <div style={{ ...text, marginTop: "2px" }}>{x.details}</div> : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {(education.length > 0 || !any) && (
          <section>
            <h3 style={sectionTitle}>Education</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "3mm" }}>
              {(education.length > 0 ? education : [placeholderEducation]).map((e) => (
                <div key={e.id} style={!education.length ? ghost : undefined}>
                  <div style={{ fontWeight: 800, fontSize: "13px" }}>{e.institute}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "12px" }}>
                    <span style={{ fontWeight: 600 }}>{e.degree}</span>
                    <span style={{ fontWeight: 700 }}>{e.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(certifications.length > 0 || !any) && (
          <section>
            <h3 style={sectionTitle}>Certifications</h3>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", lineHeight: 1.5 }}>
              {(certifications.length > 0 ? certifications : [placeholderCert]).map((b) => (
                <li key={b.id} style={!certifications.length ? ghost : undefined}>
                  {b.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 style={sectionTitle}>Languages</h3>
          <div style={{ fontSize: "12px", lineHeight: 1.3 }}>
            <span style={!data.languages.trim() ? ghost : undefined}>{languages}</span>
          </div>
        </section>
      </div>
    </div>
  );
});
