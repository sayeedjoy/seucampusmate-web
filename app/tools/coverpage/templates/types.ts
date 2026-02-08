export interface CoverPageData {
  taskTitle: string;
  facultyInitial: string;
  facultyName: string;
  courseCode: string;
  courseTitle: string;
  program: string;
  department: string;
  semester: string;
  submissionDate: string;
  studentName: string;
  studentCode: string;
}
export type TemplateType = 'classic' | 'modern';

export interface Template {
  id: TemplateType;
  name: string;
}

export const templates: Template[] = [
  {
    id: 'classic',
    name: 'Classic Template'
  },
  {
    id: 'modern',
    name: 'Modern Template'
  },
];
