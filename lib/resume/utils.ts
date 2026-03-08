import type { Id } from "@/lib/resume/types";
import type { ResumeData } from "@/lib/resume/types";
import { emptyData } from "@/lib/resume/constants";

export function uid(): Id {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function safeParseJSON<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function normalizeData(partial: Partial<ResumeData>): ResumeData {
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

export function hasAnyContent(data: ResumeData): boolean {
  const listHas = (arr: { [k: string]: unknown }[]) =>
    arr.some((x) => Object.values(x).some((v) => String(v ?? "").trim().length > 0));
  return (
    data.name.trim() !== "" ||
    data.title.trim() !== "" ||
    data.email.trim() !== "" ||
    data.phone.trim() !== "" ||
    data.location.trim() !== "" ||
    data.summary.trim() !== "" ||
    data.technicalSkills.trim() !== "" ||
    data.softSkills.trim() !== "" ||
    data.languages.trim() !== "" ||
    listHas(data.links) ||
    listHas(data.education) ||
    listHas(data.experience) ||
    listHas(data.projects) ||
    listHas(data.achievements) ||
    listHas(data.certifications)
  );
}
