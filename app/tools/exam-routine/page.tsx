import { Metadata } from 'next';
import ExamRoutinePageClient from './ExamRoutinePageClient';

export const metadata: Metadata = {
  title: 'SEU Exam Routine Finder',
  description: 'Find your exam schedules easily by entering course codes. Get exam dates, times, and faculty information for your courses.',
  keywords: 'exam routine, exam schedule, course exam, university exam, exam finder, course codes',
  openGraph: {
    title: 'Exam Routine Finder | CampusMate',
    description: 'Find your exam schedules easily by entering course codes. Get exam dates, times, and faculty information.',
    type: 'website',
    images: [
      {
        url: '/exam-routine.webp',
        width: 1200,
        height: 630,
        alt: 'Exam Routine Finder - CampusMate'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exam Routine Finder | CampusMate',
    description: 'Find your exam schedules easily by entering course codes.',
    images: ['/exam-routine.webp']
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function ExamRoutinePage() {
  return <ExamRoutinePageClient />;
}