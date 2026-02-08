import * as React from "react"
import {
  Map,
  BarChart3,
  Bus,
  CalendarDays,
  Calculator,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/ui/container"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BentoItem {
  title: string
  description: string
  imagePlaceholder: string
  size: "large" | "small"
  icon?: LucideIcon
  badge?: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const BENTO_ITEMS: BentoItem[] = [
  {
    title: "Smart Campus Navigation",
    description:
      "Find your way across campus with our interactive map featuring real-time building availability, shortest routes between classes, and accessibility paths.",
    imagePlaceholder: "Campus Map Preview",
    size: "large",
    icon: Map,
    badge: "Navigation",
  },
  {
    title: "Academic Performance Dashboard",
    description:
      "Track your GPA, course progress, and credit completion at a glance. Visualize your academic journey with intuitive charts and milestone tracking.",
    imagePlaceholder: "Dashboard Preview",
    size: "large",
    icon: BarChart3,
    badge: "Analytics",
  },
  {
    title: "Bus Schedule Tracker",
    description:
      "Never miss a shuttle again. Real-time bus tracking with live ETAs, route maps, and push notifications for your saved routes.",
    imagePlaceholder: "Bus Tracker",
    size: "small",
    icon: Bus,
    badge: "Transport",
  },
  {
    title: "Exam Routine Planner",
    description:
      "Stay prepared with a consolidated exam schedule, countdown timers, and personalized study-plan suggestions based on your courses.",
    imagePlaceholder: "Exam Planner",
    size: "small",
    icon: CalendarDays,
    badge: "Planning",
  },
  {
    title: "CGPA Calculator",
    description:
      "Instantly calculate your current and projected CGPA. Simulate future grades to plan your path towards academic goals.",
    imagePlaceholder: "CGPA Calculator",
    size: "small",
    icon: Calculator,
    badge: "Tools",
  },
]

// ─── BentoGrid ───────────────────────────────────────────────────────────────

const BentoGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6",
      className
    )}
    {...props}
  />
))
BentoGrid.displayName = "BentoGrid"

// ─── BentoCard ───────────────────────────────────────────────────────────────

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controls column span — "large" spans 3 of 6 cols, "small" spans 2 of 6 */
  size?: "large" | "small"
  /** Text rendered inside the image placeholder area */
  imagePlaceholder?: string
  /** Card title */
  title?: string
  /** Card description */
  description?: string
  /** Optional Lucide icon */
  icon?: LucideIcon
  /** Optional badge label */
  badge?: string
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  (
    {
      className,
      size = "small",
      imagePlaceholder,
      title,
      description,
      icon: Icon,
      badge,
      children,
      ...props
    },
    ref
  ) => (
    <div ref={ref} className={cn(size === "large" ? "md:col-span-1 lg:col-span-3" : "lg:col-span-2")}>
    <Card
      size={size === "small" ? "sm" : "default"}
      className={cn(
        "flex h-full flex-col overflow-hidden transition-colors",
        className
      )}
      {...props}
    >
      {/* Image placeholder area */}
      <div
        className={cn(
          "flex items-center justify-center bg-muted/50 text-muted-foreground",
          size === "large"
            ? "aspect-[16/9] text-base font-medium"
            : "aspect-[4/3] text-sm font-medium"
        )}
      >
        {Icon ? (
          <Icon className="size-12 opacity-40" aria-hidden />
        ) : (
          imagePlaceholder
        )}
      </div>

      {/* Card content */}
      <CardHeader className="flex-1 space-y-2 pb-2">
        {badge && (
          <Badge variant="secondary" className="text-xs font-medium">
            {badge}
          </Badge>
        )}
        {title && (
          <CardTitle className="text-lg font-semibold leading-tight">
            {title}
          </CardTitle>
        )}
        {description && (
          <CardDescription className="line-clamp-3 text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      {children && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
    </div>
  )
)
BentoCard.displayName = "BentoCard"

// ─── BentoGridSection (convenience) ──────────────────────────────────────────

interface BentoGridSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Override the default items */
  items?: BentoItem[]
}

const BentoGridSection = React.forwardRef<HTMLElement, BentoGridSectionProps>(
  ({ className, items = BENTO_ITEMS, ...props }, ref) => (
    <section
      ref={ref}
      className={cn("w-full py-10 md:py-16 lg:py-24", className)}
      {...props}
    >
      <Container>
        <div className="mb-10 text-center">
          <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-bold">
            Features for Your Campus Life
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Everything you need to stay organized, productive, and connected at
            Southeast University.
          </p>
        </div>

        <BentoGrid>
          {items.map((item) => (
            <BentoCard
              key={item.title}
              size={item.size}
              imagePlaceholder={item.imagePlaceholder}
              title={item.title}
              description={item.description}
              icon={item.icon}
              badge={item.badge}
            />
          ))}
        </BentoGrid>
      </Container>
    </section>
  )
)
BentoGridSection.displayName = "BentoGridSection"

// ─── Exports ─────────────────────────────────────────────────────────────────

export { BentoGrid, BentoCard, BentoGridSection }
export type { BentoCardProps, BentoGridSectionProps }
