export type Id = string;

export type LinkItem = { id: Id; platform: string; url: string };
export type EducationItem = { id: Id; institute: string; degree: string; year: string };
export type ExperienceItem = { id: Id; org: string; role: string; duration: string; details: string };
export type ProjectItem = { id: Id; name: string; description: string; link: string; tools: string };
export type BulletItem = { id: Id; text: string };

export type ResumeData = {
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

export type ArrayKeys<T> = {
  [K in keyof T]-?: T[K] extends Array<unknown> ? K : never;
}[keyof T];

export type ItemOf<T> = T extends Array<infer U> ? U : never;
