import ExamRoutinePageClient from './ExamRoutinePageClient';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata('examRoutine', {
  openGraph: {
    images: [
      {
        url: '/exam-routine.webp',
        width: 1200,
        height: 630,
        alt: 'Exam Routine Finder - CampusMate',
      },
    ],
  },
});

export default function ExamRoutinePage() {
  return <ExamRoutinePageClient />;
}