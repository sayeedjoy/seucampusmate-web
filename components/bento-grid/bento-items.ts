import {
  Map,
  BarChart3,
  Bus,
  CalendarDays,
  Calculator,
} from "lucide-react"
import type { BentoItem } from "./types"

export const BENTO_ITEMS: BentoItem[] = [
  {
    title: "Class Routine",
    description:
      "View your class schedule, room locations",
    imagePlaceholder: "Campus Map Preview",
    size: "large",
    image: "/bento/routine.png",
    icon: Map,
    badge: "Navigation",
    iconColorClass: "text-blue-600 dark:text-blue-400",
    iconBgClass: "bg-blue-100 dark:bg-blue-950/50",
  },
  {
    title: "Academic Performance Dashboard",
    description:
      "Track your GPA, course progress, and credit completion at a glance. Visualize your academic journey with intuitive charts and milestone tracking.",
    imagePlaceholder: "Dashboard Preview",
    size: "large",
    image: "/bento/assesment.png",
    icon: BarChart3,
    badge: "Analytics",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
    iconBgClass: "bg-emerald-100 dark:bg-emerald-950/50",
  },
  {
    title: "Bus Schedule Tracker",
    description:
      "Never miss a shuttle again. Real-time bus tracking with live ETAs, route maps, and push notifications for your saved routes.",
    imagePlaceholder: "Bus Tracker",
    size: "small",
    image: "/bento/todo.png",
    icon: Bus,
    badge: "Transport",
    iconColorClass: "text-violet-600 dark:text-violet-400",
    iconBgClass: "bg-violet-100 dark:bg-violet-950/50",
  },
  {
    title: "Exam Routine Planner",
    description:
      "Stay prepared with a consolidated exam schedule, countdown timers, and personalized study-plan suggestions based on your courses.",
    imagePlaceholder: "Exam Planner",
    size: "small",
    image: "/bento/exam-routine.png",
    icon: CalendarDays,
    badge: "Planning",
    iconColorClass: "text-amber-600 dark:text-amber-400",
    iconBgClass: "bg-amber-100 dark:bg-amber-950/50",
  },
  {
    title: "CGPA Calculator",
    description:
      "Instantly calculate your current and projected CGPA. Simulate future grades to plan your path towards academic goals.",
    imagePlaceholder: "CGPA Calculator",
    size: "small",
    image: "/bento/fee.png",
    icon: Calculator,
    badge: "Tools",
    iconColorClass: "text-rose-600 dark:text-rose-400",
    iconBgClass: "bg-rose-100 dark:bg-rose-950/50",
  },
]
