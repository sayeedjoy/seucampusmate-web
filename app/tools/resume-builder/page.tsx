"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Link as LinkIcon, PlusCircle, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Id = string;

type LinkItem = { id: Id; platform: string; url: string };
type EducationItem = { id: Id; institute: string; degree: string; year: string };
type ExperienceItem = { id: Id; org: string; role: string; duration: string; details: string };
type ProjectItem = { id: Id; name: string; description: string; link: string; tools: string };
type BulletItem = { id: Id; text: string };

type ResumeData = {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;

    links: LinkItem[];
    education: EducationItem[];
    experience: ExperienceItem[];
    projects: ProjectItem[];
    achievements: BulletItem[];
    certifications: BulletItem[];

    technicalSkills: string;
    softSkills: string;
    languages: string;
};

const STORAGE_KEY = "seu_campusmate_resume_builder_v_final_pdf_ok";

const uid = (): Id => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const emptyData: ResumeData = {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    summary: "",

    links: [],
    education: [],
    experience: [],
    projects: [],
    achievements: [],
    certifications: [],

    technicalSkills: "",
    softSkills: "",
    languages: "",
};

function safeParseJSON<T>(value: string): T | null {
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

function normalizeData(partial: Partial<ResumeData>): ResumeData {
    return {
        ...emptyData,
        ...partial,
        links: Array.isArray(partial.links) ? partial.links : [],
        education: Array.isArray(partial.education) ? partial.education : [],
        experience: Array.isArray(partial.experience) ? partial.experience : [],
        projects: Array.isArray(partial.projects) ? partial.projects : [],
        achievements: Array.isArray(partial.achievements) ? partial.achievements : [],
        certifications: Array.isArray(partial.certifications) ? partial.certifications : [],
    };
}

type ArrayKeys<T> = {
    [K in keyof T]-?: T[K] extends Array<unknown> ? K : never;
}[keyof T];

type ItemOf<T> = T extends Array<infer U> ? U : never;

const mmToPx = (mm: number) => (mm * 96) / 25.4;
const A4_W_MM = 210;
const A4_H_MM = 297;
const A4_W_PX_AT_96 = Math.round(mmToPx(A4_W_MM));
const A4_H_PX_AT_96 = Math.round(mmToPx(A4_H_MM));

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

function hasAnyContent(d: ResumeData) {
    const listHas = (arr: { [k: string]: unknown }[]) => arr.some((x) => Object.values(x).some((v) => String(v ?? "").trim().length > 0));
    return (
        d.name.trim() ||
        d.title.trim() ||
        d.email.trim() ||
        d.phone.trim() ||
        d.location.trim() ||
        d.summary.trim() ||
        d.technicalSkills.trim() ||
        d.softSkills.trim() ||
        d.languages.trim() ||
        listHas(d.links) ||
        listHas(d.education) ||
        listHas(d.experience) ||
        listHas(d.projects) ||
        listHas(d.achievements) ||
        listHas(d.certifications)
    );
}

const ResumeSheet = React.forwardRef<HTMLDivElement, { data: ResumeData; rootId: string }>(function ResumeSheet({ data, rootId }, ref) {
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

                    {links.length > 0 || !any ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", lineHeight: 1.2 }}>
                            {(links.length > 0
                                    ? links
                                    : [{ id: "g1", platform: "LinkedIn", url: "linkedin.com/in/yourname" } as LinkItem, { id: "g2", platform: "Portfolio", url: "your-portfolio.com" } as LinkItem]
                            ).map((l) => (
                                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <LinkIcon className="h-3 w-3" />
                                    <span style={{ fontWeight: 700 }}>{l.platform || "Link"}:</span>
                                    <span style={{ textDecoration: "underline", ...(l.url ? undefined : ghost) }}>{l.url || "your-link"}</span>
                                </div>
                            ))}
                        </div>
                    ) : null}
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

                {achievements.length > 0 || !any ? (
                    <section>
                        <h3 style={sectionTitle}>Key Achievements</h3>
                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", lineHeight: 1.5 }}>
                            {(achievements.length > 0
                                    ? achievements
                                    : [
                                        { id: "a1", text: "Example: Organized/led events or workshops and engaged participants." },
                                        { id: "a2", text: "Example: Built a project, improved a process, or achieved measurable results." },
                                    ]
                            ).map((b) => (
                                <li key={b.id} style={!achievements.length ? ghost : undefined}>
                                    {b.text}
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {projects.length > 0 || !any ? (
                    <section>
                        <h3 style={sectionTitle}>Projects / Activities</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4mm" }}>
                            {(projects.length > 0
                                    ? projects
                                    : [
                                        {
                                            id: "p1",
                                            name: "Example Project / Case Study / Lab Work",
                                            description: "Write 1–2 lines: what you did, what problem it solved, and the outcome.",
                                            link: "project-link.com",
                                            tools: "Tools/Methods: Excel, PowerPoint / MATLAB / Next.js etc.",
                                        } as ProjectItem,
                                    ]
                            ).map((p) => (
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
                ) : null}

                {experience.length > 0 || !any ? (
                    <section>
                        <h3 style={sectionTitle}>Experience</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4mm" }}>
                            {(experience.length > 0
                                    ? experience
                                    : [
                                        {
                                            id: "e1",
                                            org: "Example Organization",
                                            role: "Role / Position",
                                            duration: "2024 - Present",
                                            details: "Write 1–2 lines about responsibilities and impact.",
                                        } as ExperienceItem,
                                    ]
                            ).map((x) => (
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
                ) : null}

                {education.length > 0 || !any ? (
                    <section>
                        <h3 style={sectionTitle}>Education</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3mm" }}>
                            {(education.length > 0
                                    ? education
                                    : [
                                        {
                                            id: "ed1",
                                            institute: "Southeast University",
                                            degree: "Degree / Program (e.g., BBA / EEE / CSE)",
                                            year: "2023 - Present",
                                        } as EducationItem,
                                    ]
                            ).map((e) => (
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
                ) : null}

                {certifications.length > 0 || !any ? (
                    <section>
                        <h3 style={sectionTitle}>Certifications</h3>
                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", lineHeight: 1.5 }}>
                            {(certifications.length > 0 ? certifications : [{ id: "c1", text: "Example: Course / Training / Competition participation." } as BulletItem]).map((b) => (
                                <li key={b.id} style={!certifications.length ? ghost : undefined}>
                                    {b.text}
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

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

export default function ResumeBuilder() {
    const [data, setData] = useState<ResumeData>(emptyData);
    const [hydrated, setHydrated] = useState(false);
    const [scale, setScale] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isWide, setIsWide] = useState(false);

    const previewOuterRef = useRef<HTMLDivElement>(null);
    const printRootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setHydrated(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        const parsed = safeParseJSON<Partial<ResumeData>>(saved);
        if (!parsed) return;
        setData(normalizeData(parsed));
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data, hydrated]);

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

    const onField =
        (name: keyof ResumeData) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const value = e.target.value;
                setData((prev) => ({ ...prev, [name]: value }));
            };

    const updateArrayItem = <K extends ArrayKeys<ResumeData>>(section: K, id: Id, patch: Partial<ItemOf<ResumeData[K]>>) => {
        setData((prev) => {
            const list = prev[section] as unknown as Array<{ id: Id }>;
            const next = list.map((it) => (it.id === id ? { ...it, ...patch } : it));
            return { ...prev, [section]: next } as ResumeData;
        });
    };

    const removeArrayItem = <K extends ArrayKeys<ResumeData>>(section: K, id: Id) => {
        setData((prev) => {
            const list = prev[section] as unknown as Array<{ id: Id }>;
            const next = list.filter((it) => it.id !== id);
            return { ...prev, [section]: next } as ResumeData;
        });
    };

    const addArrayItem = <K extends ArrayKeys<ResumeData>>(section: K, item: ItemOf<ResumeData[K]>) => {
        setData((prev) => {
            const list = prev[section] as unknown as Array<ItemOf<ResumeData[K]>>;
            return { ...prev, [section]: [...list, item] } as ResumeData;
        });
    };

    const resetAll = () => {
        const ok = window.confirm("Reset all data?");
        if (!ok) return;
        localStorage.removeItem(STORAGE_KEY);
        setData(emptyData);
    };

    const pdfFileName = useMemo(() => {
        const base = (data.name || "Resume").trim().replace(/\s+/g, "_");
        return `${base || "Resume"}_A4.pdf`;
    }, [data.name]);

    const nextFrame = () => new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));

    const downloadPDF = async () => {
        const el = printRootRef.current;
        if (!el) return;

        setIsGenerating(true);

        try {
            await nextFrame();

            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                foreignObjectRendering: false,
                windowWidth: el.scrollWidth,
                windowHeight: el.scrollHeight,
                onclone: (clonedDoc) => {
                    const style = clonedDoc.createElement("style");
                    style.innerHTML = `
            html, body { background: #fff !important; color: #000 !important; }
            #resume-print-root { background: #fff !important; color: #000 !important; font-family: Arial, Helvetica, sans-serif !important; }
            #resume-print-root, #resume-print-root * {
              color: #000 !important;
              background: transparent !important;
              border-color: #000 !important;
              box-shadow: none !important;
              filter: none !important;
              text-shadow: none !important;
            }
            #resume-print-root svg { color: #000 !important; fill: currentColor !important; stroke: currentColor !important; }
          `;
                    clonedDoc.head.appendChild(style);

                    const root = clonedDoc.getElementById("resume-print-root") as HTMLDivElement | null;
                    if (root) {
                        root.style.backgroundColor = "#ffffff";
                        root.style.color = "#000000";
                        root.style.fontFamily = "Arial, Helvetica, sans-serif";
                    }
                },
            });

            const pdf = new jsPDF("p", "mm", "a4");
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();

            const pxPerMm = canvas.width / pageW;
            const pxPageH = Math.floor(pageH * pxPerMm);

            const pageCanvas = document.createElement("canvas");
            const pageCtx = pageCanvas.getContext("2d");
            if (!pageCtx) throw new Error("Canvas context not found");

            pageCanvas.width = canvas.width;

            let y = 0;
            let pageIndex = 0;

            while (y < canvas.height - 2) {
                const remaining = canvas.height - y;
                const slice = Math.min(pxPageH, remaining);
                if (slice < 8) break;

                pageCanvas.height = slice;
                pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
                pageCtx.drawImage(canvas, 0, y, canvas.width, slice, 0, 0, canvas.width, slice);

                const img = pageCanvas.toDataURL("image/png", 1.0);
                const sliceMm = slice / pxPerMm;

                if (pageIndex > 0) pdf.addPage();
                pdf.addImage(img, "PNG", 0, 0, pageW, sliceMm);

                y += slice;
                pageIndex += 1;
            }

            pdf.save(pdfFileName);
        } catch (e) {
            console.error(e);
            alert("PDF generation failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!hydrated) return null;

    return (
        <div className="container mx-auto max-w-7xl py-8 px-4 space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border bg-secondary/20 p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-primary">Resume Builder</h1>
                    <p className="text-sm text-muted-foreground">Build a professional, ATS-friendly resume instantly.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={resetAll}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>

                    <Button size="sm" onClick={downloadPDF} disabled={isGenerating} className="min-w-[160px] bg-green-600 text-white hover:bg-green-700">
                        <Download className="mr-2 h-4 w-4" />
                        {isGenerating ? "Processing..." : "Download PDF"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start min-w-0">
                <div className="order-2 space-y-6 xl:order-1 min-w-0">
                    <div
                        className="space-y-6 overflow-y-auto pr-1"
                        style={
                            isWide
                                ? {
                                    height: previewHeightPx,
                                    maxHeight: previewHeightPx,
                                }
                                : undefined
                        }
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input value={data.name} onChange={onField("name")} placeholder="Kazi Azmainur Rahman" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input value={data.title} onChange={onField("title")} placeholder="Full Stack Developer" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input value={data.email} onChange={onField("email")} placeholder="yourmail@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input value={data.phone} onChange={onField("phone")} placeholder="+880 1XXXXXXXXX" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input value={data.location} onChange={onField("location")} placeholder="Dhaka, Bangladesh" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Summary</Label>
                                    <Textarea value={data.summary} onChange={onField("summary")} className="h-32" placeholder="Write 2–4 lines about yourself..." />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <CardTitle className="text-base">Social Links</CardTitle>
                                <Button size="sm" variant="ghost" onClick={() => addArrayItem("links", { id: uid(), platform: "", url: "" })}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.links.map((link) => (
                                    <div key={link.id} className="flex items-center gap-2">
                                        <Input placeholder="LinkedIn / Portfolio" value={link.platform} onChange={(e) => updateArrayItem("links", link.id, { platform: e.target.value })} className="w-[34%]" />
                                        <Input placeholder="URL" value={link.url} onChange={(e) => updateArrayItem("links", link.id, { url: e.target.value })} />
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeArrayItem("links", link.id)} aria-label="Remove link">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Skills</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Technical Skills</Label>
                                    <Input value={data.technicalSkills} onChange={onField("technicalSkills")} placeholder="Excel, PowerPoint, Python, MATLAB..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Soft Skills</Label>
                                    <Input value={data.softSkills} onChange={onField("softSkills")} placeholder="Communication, Teamwork..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Languages</Label>
                                    <Input value={data.languages} onChange={onField("languages")} placeholder="Bangla (Native), English (Professional)" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <CardTitle className="text-base">Key Achievements</CardTitle>
                                <Button size="sm" variant="ghost" onClick={() => addArrayItem("achievements", { id: uid(), text: "" })}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.achievements.map((a) => (
                                    <div key={a.id} className="flex items-center gap-2">
                                        <Input placeholder="Example: Organized 12 workshops engaging 300+ students" value={a.text} onChange={(e) => updateArrayItem("achievements", a.id, { text: e.target.value })} />
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeArrayItem("achievements", a.id)} aria-label="Remove achievement">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <CardTitle className="text-base">Education</CardTitle>
                                <Button size="sm" variant="ghost" onClick={() => addArrayItem("education", { id: uid(), institute: "", degree: "", year: "" })}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.education.map((edu) => (
                                    <div key={edu.id} className="relative rounded border bg-secondary/10 p-4">
                                        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 text-red-500" onClick={() => removeArrayItem("education", edu.id)} aria-label="Remove education">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <Input className="mb-2 font-semibold" placeholder="Institution" value={edu.institute} onChange={(e) => updateArrayItem("education", edu.id, { institute: e.target.value })} />

                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                            <Input placeholder="Degree / Program" value={edu.degree} onChange={(e) => updateArrayItem("education", edu.id, { degree: e.target.value })} />
                                            <Input placeholder="Year / Duration" value={edu.year} onChange={(e) => updateArrayItem("education", edu.id, { year: e.target.value })} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <CardTitle className="text-base">Projects / Activities</CardTitle>
                                <Button size="sm" variant="ghost" onClick={() => addArrayItem("projects", { id: uid(), name: "", description: "", link: "", tools: "" })}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.projects.map((proj) => (
                                    <div key={proj.id} className="relative rounded border bg-secondary/10 p-4">
                                        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 text-red-500" onClick={() => removeArrayItem("projects", proj.id)} aria-label="Remove project">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <Input className="mb-2 font-semibold" placeholder="Title" value={proj.name} onChange={(e) => updateArrayItem("projects", proj.id, { name: e.target.value })} />
                                        <Input className="mb-2" placeholder="Tools / Methods (optional)" value={proj.tools} onChange={(e) => updateArrayItem("projects", proj.id, { tools: e.target.value })} />
                                        <Textarea className="mb-2" placeholder="Description (what you did + outcome)" value={proj.description} onChange={(e) => updateArrayItem("projects", proj.id, { description: e.target.value })} />
                                        <Input placeholder="Link (optional)" value={proj.link} onChange={(e) => updateArrayItem("projects", proj.id, { link: e.target.value })} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <CardTitle className="text-base">Experience</CardTitle>
                                <Button size="sm" variant="ghost" onClick={() => addArrayItem("experience", { id: uid(), org: "", role: "", duration: "", details: "" })}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.experience.map((exp) => (
                                    <div key={exp.id} className="relative rounded border bg-secondary/10 p-4">
                                        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 text-red-500" onClick={() => removeArrayItem("experience", exp.id)} aria-label="Remove experience">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <Input className="mb-2 font-semibold" placeholder="Organization / Company" value={exp.org} onChange={(e) => updateArrayItem("experience", exp.id, { org: e.target.value })} />
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                            <Input placeholder="Role" value={exp.role} onChange={(e) => updateArrayItem("experience", exp.id, { role: e.target.value })} />
                                            <Input placeholder="Duration" value={exp.duration} onChange={(e) => updateArrayItem("experience", exp.id, { duration: e.target.value })} />
                                        </div>
                                        <Textarea className="mt-2" placeholder="Key responsibilities / achievements" value={exp.details} onChange={(e) => updateArrayItem("experience", exp.id, { details: e.target.value })} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <CardTitle className="text-base">Certifications</CardTitle>
                                <Button size="sm" variant="ghost" onClick={() => addArrayItem("certifications", { id: uid(), text: "" })}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.certifications.map((c) => (
                                    <div key={c.id} className="flex items-center gap-2">
                                        <Input placeholder="Example: ICPC / Course / Training / Workshop" value={c.text} onChange={(e) => updateArrayItem("certifications", c.id, { text: e.target.value })} />
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeArrayItem("certifications", c.id)} aria-label="Remove certification">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div ref={previewOuterRef} className="order-1 overflow-hidden rounded-xl border bg-muted/40 p-3 xl:order-2 min-w-0">
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
                <div id="resume-print-root" ref={printRootRef as React.RefObject<HTMLDivElement>}>
                    <ResumeSheet data={data} rootId="resume-print-root" />
                </div>
            </div>
        </div>
    );
}
