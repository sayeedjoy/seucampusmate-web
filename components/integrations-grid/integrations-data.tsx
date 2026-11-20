import * as React from "react"
import Image from "next/image"
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
  FaUserEdit,
} from "react-icons/fa"
import type { Integration } from "./types"

const iconBase = "size-10 shrink-0"

// Wrapper: soft background + icon with semantic color (accessible, distinct)
function IconWrap({
  children,
  iconClass,
  bgClass,
}: {
  children: React.ReactNode
  iconClass: string
  bgClass: string
}) {
  const child = React.Children.only(children)
  const withClass =
    React.isValidElement(child) && child.type !== "img"
      ? React.cloneElement(child as React.ReactElement<{ className?: string }>, {
          className: iconClass,
        })
      : child
  return (
    <div className={`inline-flex items-center justify-center rounded-xl p-3 ${bgClass}`}>
      {withClass}
    </div>
  )
}

// CodeShare icon (PNG) – do not change style
const CodeIcon = () => (
  <Image
    src="/codeicon.png"
    alt=""
    width={40}
    height={40}
    className="!size-10 !shrink-0 object-contain block"
  />
)

// CP Leaderboard icon – do not change style
const CPIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    id="code-forces"
    className="size-10 shrink-0"
  >
    <path fill="#F44336" d="M24 19.5V12a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 18 12v7.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5z" />
    <path fill="#2196F3" d="M13.5 21a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 13.5 3h-3C9.673 3 9 3.672 9 4.5v15c0 .828.673 1.5 1.5 1.5h3z" />
    <path fill="#FFC107" d="M0 19.5c0 .828.673 1.5 1.5 1.5h3A1.5 1.5 0 0 0 6 19.5V9a1.5 1.5 0 0 0-1.5-1.5h-3C.673 7.5 0 8.172 0 9v10.5z" />
  </svg>
)

export const integrations: Integration[] = [

  {
    id: 0, // Unique ID
    name: "Resume Builder",
    description:
        "Build a clean resume with a live preview, then download it as a PDF.",
    icon: (
        <IconWrap iconClass={`${iconBase} text-cyan-600 dark:text-cyan-400`} bgClass="bg-cyan-100 dark:bg-cyan-950/50">
          <FaUserEdit />
        </IconWrap>
    ),
    href: "/tools/resume-builder",
  },

  {
    id: 1,
    name: "CGPA Calculator",
    description:
      "Work out your CGPA and see what each course grade does to it.",
    icon: (
      <IconWrap iconClass={`${iconBase} text-rose-600 dark:text-rose-400`} bgClass="bg-rose-100 dark:bg-rose-950/50">
        <FaCalculator />
      </IconWrap>
    ),
    href: "/tools/cgpa-calculator",
  },
  {
    id: 2,
    name: "Course Catalog",
    description:
      "Look up any course's credits, prerequisites and topics.",
    icon: (
      <IconWrap iconClass={`${iconBase} text-blue-600 dark:text-blue-400`} bgClass="bg-blue-100 dark:bg-blue-950/50">
        <FaBook />
      </IconWrap>
    ),
    href: "/course-catalog",
  },
  {
    id: 3,
    name: "Curriculum",
    description:
      "The CSE curriculum, semester by semester, with credits and prerequisites.",
    icon: (
      <IconWrap iconClass={`${iconBase} text-indigo-600 dark:text-indigo-400`} bgClass="bg-indigo-100 dark:bg-indigo-950/50">
        <FaListAlt />
      </IconWrap>
    ),
    href: "/curriculum",
  },
  {
    id: 4,
    name: "Assessment Tracking",
    description:
      "Keep your assignments, quizzes and exams in one list.",
    icon: (
      <IconWrap iconClass={`${iconBase} text-amber-600 dark:text-amber-400`} bgClass="bg-amber-100 dark:bg-amber-950/50">
        <FaClipboardList />
      </IconWrap>
    ),
    href: "/tools/assessment-tracking",
  },
  {
    id: 5,
    name: "CodeShare",
    description:
      "Share code with friends in real time. No sign-up needed.",
    icon: <CodeIcon />,
    href: "https://code.campusmate.app/",
  },
  {
    id: 6,
    name: "Tuition Calculator",
    description:
      "Work out your semester fee, waiver included, split into installments.",
    icon: (
      <IconWrap iconClass={`${iconBase} text-emerald-600 dark:text-emerald-400`} bgClass="bg-emerald-100 dark:bg-emerald-950/50">
        <FaDollarSign />
      </IconWrap>
    ),
    href: "/tools/tuition-calculator",
  },
  {
    id: 7,
    name: "Exam Routine",
    description:
      "Search a course code for its exam date, time and room.",
    icon: (
      <IconWrap iconClass={`${iconBase} text-yellow-600 dark:text-yellow-400`} bgClass="bg-yellow-100 dark:bg-yellow-950/50">
        <FaStar />
      </IconWrap>
    ),
    href: "/tools/exam-routine",
  },
  {
    id: 8,
    name: "Academic Calendar",
    description:
      "University events, deadlines and key dates for the year.",
    icon: (
      <IconWrap iconClass={`${iconBase} text-violet-600 dark:text-violet-400`} bgClass="bg-violet-100 dark:bg-violet-950/50">
        <FaCalendarAlt />
      </IconWrap>
    ),
    href: "/tools/academic-calendar",
  },
  {
    id: 9,
    name: "Cover Page Generator",
    description:
      "Fill in your details and download an assignment cover page as a PDF.",
    icon: (
      <IconWrap iconClass={`${iconBase} text-slate-600 dark:text-slate-400`} bgClass="bg-slate-100 dark:bg-slate-800/50">
        <FaFileAlt />
      </IconWrap>
    ),
    href: "/tools/coverpage",
  },
  {
    id: 10,
    name: "Blood Donor",
    description: "Find nearby blood donors and blood banks when it matters.",
    icon: (
      <IconWrap iconClass={`${iconBase} text-red-600 dark:text-red-400`} bgClass="bg-red-100 dark:bg-red-950/50">
        <FaHeartbeat />
      </IconWrap>
    ),
    href: "/tools/blood-donors",
  },
  {
    id: 11,
    name: "CP Leaderboard",
    description:
      "Codeforces rankings for SEU's competitive programmers.",
    icon: <CPIcon />,
    href: "/cp",
  },
]
