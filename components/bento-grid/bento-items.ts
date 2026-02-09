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
    title: "Semester Marks Tracker",
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
    title: "Todo List",
    description:
      "Create a todo list to keep track of your tasks and deadlines.",
    imagePlaceholder: "Bus Tracker",
    size: "small",
    image: "/bento/todo.png",
    icon: Bus,
    badge: "Transport",
    iconColorClass: "text-violet-600 dark:text-violet-400",
    iconBgClass: "bg-violet-100 dark:bg-violet-950/50",
  },
  {
    title: "Exam Schedule",
    description:
      "View your exam schedule, room locations and exam dates.",
    imagePlaceholder: "Exam Planner",
    size: "small",
    image: "/bento/exam-routine.png",
    icon: CalendarDays,
    badge: "Planning",
    iconColorClass: "text-amber-600 dark:text-amber-400",
    iconBgClass: "bg-amber-100 dark:bg-amber-950/50",
  },
  {
    title: "Semester Fee Calculator",
    description:
      "Calculate your semester fees, payment schedules and financial obligations.",
    imagePlaceholder: "CGPA Calculator",
    size: "small",
    image: "/bento/fee.png",
    icon: Calculator,
    badge: "Tools",
    iconColorClass: "text-rose-600 dark:text-rose-400",
    iconBgClass: "bg-rose-100 dark:bg-rose-950/50",
  },
]
