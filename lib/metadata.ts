import type { Metadata } from 'next';

// Base metadata configuration
export const baseMetadata: Metadata = {
  metadataBase: new URL('https://campusmate.app'),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'SEU CampusMate',
    images: [
      {
        url: '/logo.webp',
        width: 1200,
        height: 630,
        alt: 'SEU CampusMate Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/logo.webp'],
  },
};

const METADATA_BASE_URL = "https://campusmate.app";

// Page-specific metadata configurations with path for canonical URLs
export const pageMetadata = {
  home: {
    title: "SEU CampusMate - Ultimate tool for SEU Students",
    description:
      "A student companion app for Southeast University offering class routine widgets, CGPA and attendance calculators, faculty reviews, forums, and academic tools.",
    path: "/",
  },
  about: {
    title: "About SEU CampusMate",
    description:
      "Learn more about SEU CampusMate, the ultimate student companion app for Southeast University students. Discover our mission and how we help students succeed.",
    path: "/about",
  },
  contact: {
    title: "Contact Us",
    description:
      "Get in touch with the SEU CampusMate team for support, feedback, or collaboration opportunities. We're here to help with your academic journey.",
    path: "/contact",
  },
  tools: {
    title: "Academic Tools",
    description:
      "Access a comprehensive suite of academic tools including CGPA calculator, attendance tracker, exam routine, tuition calculator, and more for SEU students.",
    path: "/tools",
  },
  examRoutine: {
    title: "Exam Routine Finder",
    description:
      "Find your exam schedules easily by entering course codes. Get exam dates, times, and faculty information for your courses at Southeast University.",
    path: "/tools/exam-routine",
  },
  cgpaCalculator: {
    title: "CGPA Calculator",
    description:
      "Calculate your Cumulative Grade Point Average (CGPA) with our easy-to-use calculator designed for SEU students. Track your academic performance and plan your studies.",
    path: "/tools/cgpa-calculator",
  },
  attendanceCalculator: {
    title: "Attendance Calculator",
    description:
      "Track your class attendance and ensure you meet the 75% requirement at Southeast University. Calculate how many classes you can miss while maintaining attendance.",
    path: "/tools/attendance-calculator",
  },
  facultyInfo: {
    title: "Faculty Information",
    description:
      "Find detailed information about SEU faculty members, their contact details, office hours, and department assignments. Connect with your professors easily.",
    path: "/tools/faculty-info",
  },
  campusInfo: {
    title: "Campus Information",
    description:
      "Explore Southeast University campus facilities, locations, and important information. Find buildings, services, and campus resources at your fingertips.",
    path: "/tools/campus-info",
  },
  importantContacts: {
    title: "Important Contacts",
    description:
      "Access important contact information for SEU departments, faculty, administrative offices, and emergency services. Quick reference when you need help.",
    path: "/tools/important-contacts",
  },
  academicCalendar: {
    title: "Academic Calendar",
    description:
      "Stay updated with SEU's academic calendar, important dates, semester schedules, registration deadlines, and exam periods. Never miss a key date.",
    path: "/tools/academic-calendar",
  },
  assessmentTracking: {
    title: "Assessment Tracking",
    description:
      "Track your academic assessments, assignments, quizzes, and grades with our assessment tracking tool. Stay organized throughout the semester.",
    path: "/tools/assessment-tracking",
  },
  bloodDonors: {
    title: "Blood Donors Directory",
    description:
      "Find blood donors within the SEU community when you need them most. Connect with registered donors for emergency blood donation requests.",
    path: "/tools/blood-donors",
  },
  portalsLinks: {
    title: "Portal Links",
    description:
      "Quick access to all important SEU portal links and online resources. Student portal, LMS, and university websites in one convenient place.",
    path: "/tools/portals-links",
  },
  questionBank: {
    title: "Question Bank",
    description:
      "Access a comprehensive question bank for SEU courses and subjects. Previous years' papers and practice tests to help you prepare for exams.",
    path: "/tools/question-bank",
  },
  tuitionCalculator: {
    title: "Tuition Calculator",
    description:
      "Calculate your tuition fees, payment schedules, and track financial obligations at Southeast University. Plan your semester expenses with ease.",
    path: "/tools/tuition-calculator",
  },
  coverpage: {
    title: "Cover Page Generator",
    description:
      "Generate professional cover pages for your assignments with our easy-to-use cover page generator. Customizable fields and instant PDF download for SEU students.",
    path: "/tools/coverpage",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "Read SEU CampusMate's privacy policy to understand how we collect, use, and protect your personal data. Your privacy and security matter to us.",
    path: "/privacy",
  },
  terms: {
    title: "Terms of Service",
    description:
      "Read SEU CampusMate's terms of service and usage guidelines. Understand your rights and responsibilities when using our platform and services.",
    path: "/terms",
  },
  curriculum: {
    title: "SEU CSE Course Curriculum",
    description:
      "Explore the complete B.Sc. in Computer Science & Engineering curriculum at Southeast University. View all 12 semesters, courses, credits, and prerequisites.",
    path: "/curriculum",
  },
  cp: {
    title: "CP Leaderboard",
    description:
      "View the top Codeforces users from Southeast University. Real-time competitive programming leaderboard for SEU students. Track rankings and progress.",
    path: "/cp",
  },
  bus: {
    title: "Bus Routes",
    description:
      "View SEU bus routes and stops. Interactive map showing all university bus routes with detailed stop information. Plan your campus commute easily.",
    path: "/bus",
  },
  courseCatalog: {
    title: "Course Catalog",
    description:
      "Explore the complete course catalog for Southeast University. Browse courses, prerequisites, credits, and descriptions for all programs offered at SEU.",
    path: "/course-catalog",
  },
} as const;

export type PageMetadataKey = keyof typeof pageMetadata;

// Helper function to create metadata for pages
export function createPageMetadata(
  pageKey: PageMetadataKey,
  customProps?: {
    title?: string;
    description?: string;
    canonical?: string;
    openGraph?: {
      title?: string;
      description?: string;
      images?: Array<{
        url: string;
        width: number;
        height: number;
        alt: string;
      }>;
    };
  }
): Metadata {
  const defaultPageMeta = pageMetadata[pageKey];
  const canonical =
    customProps?.canonical ||
    (defaultPageMeta.path === "/" ? METADATA_BASE_URL : `${METADATA_BASE_URL}${defaultPageMeta.path}`);

  return {
    ...baseMetadata,
    title: customProps?.title || defaultPageMeta.title,
    description: customProps?.description || defaultPageMeta.description,
    alternates: {
      canonical,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: customProps?.openGraph?.title || defaultPageMeta.title,
      description: customProps?.openGraph?.description || defaultPageMeta.description,
      url: canonical,
      images: customProps?.openGraph?.images || baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: customProps?.title || defaultPageMeta.title,
      description: customProps?.description || defaultPageMeta.description,
    },
  };
}

// Helper function for dynamic pages
export function createDynamicMetadata(props: {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
  };
}): Metadata {
  return {
    ...baseMetadata,
    title: props.title,
    description: props.description,
    alternates: {
      canonical: props.canonical,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: props.openGraph?.title || props.title,
      description: props.openGraph?.description || props.description,
      images: props.openGraph?.images || baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: props.title,
      description: props.description,
    },
  };
}
