import {
    FaCalculator,
    FaClipboardList,
    FaDollarSign,
    FaStar,
    FaCalendarAlt,
    FaFileAlt,
    FaHeartbeat,
    FaBook,
    FaListAlt,
} from "react-icons/fa";
import { type Feature } from "@/components/feature/types";

// Icon component for CodeShare (PNG image)
const CodeIcon = () => (
    <img
        src="/codeicon.png"
        alt="Code icon"
        className="!w-6 !h-6"
        style={{
            objectFit: 'contain',
            display: 'block'
        }}
    />
);

// CP Leaderboard icon
const CPIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="code-forces" className="w-5 h-5">
        <path fill="#F44336" d="M24 19.5V12a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 18 12v7.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5z"></path>
        <path fill="#2196F3" d="M13.5 21a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 13.5 3h-3C9.673 3 9 3.672 9 4.5v15c0 .828.673 1.5 1.5 1.5h3z"></path>
        <path fill="#FFC107" d="M0 19.5c0 .828.673 1.5 1.5 1.5h3A1.5 1.5 0 0 0 6 19.5V9a1.5 1.5 0 0 0-1.5-1.5h-3C.673 7.5 0 8.172 0 9v10.5z"></path>
    </svg>
);

export const features: Feature[] = [
    {
        title: "CGPA Calculator",
        description:
            "Calculate your CGPA with precision, track semester performance, and strategically plan your academic journey.",
        icon: FaCalculator,
        link: "/tools/cgpa-calculator",
    },
    {
        title: "Course Catalog",
        description:
            "Explore the complete curriculum with detailed course information, prerequisites, credits, and topics.",
        icon: FaBook,
        link: "/course-catalog",
    },
    {
        title: "Curriculum",
        description:
            "View the complete CSE curriculum with semester-wise course breakdown, credit distribution, and prerequisites.",
        icon: FaListAlt,
        link: "/curriculum",
    },
    {
        title: "Assessment Tracking",
        description:
            "Organize and track all your assignments, quizzes, and examination schedules with smart notifications.",
        icon: FaClipboardList,
        link: "/tools/assessment-tracking",
    },
    {
        title: "CodeShare",
        description:
            "Share Code Instantly to your friends in real time and collaborate with them, no signup or login required.",
        icon: CodeIcon,
        link: "https://code.campusmate.app/",
    },
    {
        title: "Tuition Calculator",
        description: "Calculate semester fees, manage payment schedules, and track your financial obligations efficiently.",
        icon: FaDollarSign,
        link: "/tools/tuition-calculator",
    },
    {
        title: "Exam Routine",
        description:
            "Manage comprehensive exam schedules, track preparation progress, and analyze your performance trends.",
        icon: FaStar,
        link: "/tools/exam-routine",
    },
    {
        title: "Academic Calendar",
        description: "Stay updated with university events, deadlines, and important academic dates throughout the year.",
        icon: FaCalendarAlt,
        link: "/tools/academic-calendar",
    },
    {
        title: "Cover Page Generator",
        description: "Create professional cover pages for your assignments with customizable fields and instant PDF download.",
        icon: FaFileAlt,
        link: "/tools/coverpage",
    },
    {
        title: "Blood Donor",
        description: "Find and connect with nearby blood donors or banks when needed.",
        icon: FaHeartbeat,
        link: "/tools/blood-donors",
    },
    {
        title: "CP Leaderboard",
        description: "Codeforces CP Leaderboard for SEU students to track competitive programming progress.",
        icon: CPIcon,
        link: "/cp",
    },
];
