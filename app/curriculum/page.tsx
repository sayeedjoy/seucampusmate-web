import { createPageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import curriculumData from './semester-wise.json';
import { CurriculumClient } from './CurriculumClient';

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
  return <CurriculumClient curriculum={curriculum} />;
}
