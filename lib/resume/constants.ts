import type { ResumeData } from "./types";

export const STORAGE_KEY = "seu_campusmate_resume_builder_v_final_pdf_ok";

export const emptyData: ResumeData = {
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

const mmToPx = (mm: number) => (mm * 96) / 25.4;
export const A4_W_MM = 210;
export const A4_H_MM = 297;

export const A4_W_PX_AT_96 = Math.round(mmToPx(A4_W_MM));
export const A4_H_PX_AT_96 = Math.round(mmToPx(A4_H_MM));
