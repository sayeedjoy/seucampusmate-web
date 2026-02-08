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

// Page-specific metadata configurations
export const pageMetadata = {
  home: {
    title: "SEU CampusMate - Ultimate tool for SEU Students",
    description: "A student companion app for Southeast University offering class routine widgets, CGPA and attendance calculators, faculty reviews, forums, and academic tools.",
  },
  about: {
    title: "About SEU CampusMate",
    description: "Learn more about SEU CampusMate, the ultimate student companion app for Southeast University students.",
  },
  contact: {
    title: "Contact Us",
    description: "Get in touch with the SEU CampusMate team for support, feedback, or collaboration opportunities.",
  },
  tools: {
    title: "Academic Tools",
    description: "Access a comprehensive suite of academic tools including CGPA calculator, attendance tracker, exam routine, and more.",
  },
  examRoutine: {
    title: "Exam Routine",
    description: "View and manage your exam schedule with SEU CampusMate's exam routine feature.",
  },
  cgpaCalculator: {
    title: "CGPA Calculator",
    description: "Calculate your CGPA easily with our advanced CGPA calculator designed for SEU students.",
  },
  attendanceCalculator: {
    title: "Attendance Calculator",
    description: "Track your class attendance and calculate attendance percentages with our attendance calculator.",
  },
  facultyInfo: {
    title: "Faculty Information",
    description: "Find detailed information about SEU faculty members, their contact details, and office hours.",
  },
  campusInfo: {
    title: "Campus Information",
    description: "Explore Southeast University campus facilities, locations, and important information.",
  },
  importantContacts: {
    title: "Important Contacts",
    description: "Access important contact information for SEU departments, faculty, and administrative offices.",
  },
  academicCalendar: {
    title: "Academic Calendar",
    description: "Stay updated with SEU's academic calendar, important dates, and semester schedules.",
  },
  assessmentTracking: {
    title: "Assessment Tracking",
    description: "Track your academic assessments, assignments, and grades with our assessment tracking tool.",
  },
  bloodDonors: {
    title: "Blood Donors Directory",
    description: "Find blood donors within the SEU community when you need them most.",
  },
  portalsLinks: {
    title: "Portal Links",
    description: "Quick access to all important SEU portal links and online resources.",
  },
  questionBank: {
    title: "Question Bank",
    description: "Access a comprehensive question bank for SEU courses and subjects.",
  },
  tuitionCalculator: {
    title: "Tuition Calculator",
    description: "Calculate your tuition fees and other academic expenses with our tuition calculator.",
  },
  privacy: {
    title: "Privacy Policy",
    description: "Read SEU CampusMate's privacy policy to understand how we protect your data.",
  },
  terms: {
    title: "Terms of Service",
    description: "Read SEU CampusMate's terms of service and usage guidelines.",
  },
  curriculum: {
    title: "SEU CSE Course Curriculum",
    description: "Explore the complete B.Sc. in Computer Science & Engineering curriculum at Southeast University. View all 12 semesters, courses, credits, and prerequisites.",
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
  
  return {
    ...baseMetadata,
    title: customProps?.title || defaultPageMeta.title,
    description: customProps?.description || defaultPageMeta.description,
    alternates: {
      canonical: customProps?.canonical || `/${pageKey === 'home' ? '' : pageKey}`,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: customProps?.openGraph?.title || defaultPageMeta.title,
      description: customProps?.openGraph?.description || defaultPageMeta.description,
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
