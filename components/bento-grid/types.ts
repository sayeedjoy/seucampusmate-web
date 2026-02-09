import type * as React from "react"
import type { LucideIcon } from "lucide-react"

export interface BentoItem {
  title: string
  description: string
  imagePlaceholder: string
  size: "large" | "small"
  /** Optional image path (e.g. /bento/routine.png). When set, shown in the card header area. */
  image?: string
  icon?: LucideIcon | React.ComponentType<{ className?: string }>
  badge?: string
  /** Tailwind class for icon color (e.g. text-blue-600). Ignored when iconVariant is "custom". */
  iconColorClass?: string
  /** Tailwind class for icon container background (e.g. bg-blue-100). Ignored when iconVariant is "custom". */
  iconBgClass?: string
  /** When "custom", icon is rendered as-is with no color or size overrides (e.g. CodeShare, CodeForce). */
  iconVariant?: "default" | "custom"
}

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controls column span — "large" spans 3 of 6 cols, "small" spans 2 of 6 */
  size?: "large" | "small"
  /** Text rendered inside the image placeholder area */
  imagePlaceholder?: string
  /** Optional image path for the card header area */
  image?: string
  /** Card title */
  title?: string
  /** Card description */
  description?: string
  /** Optional Lucide or custom icon component */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>
  /** Optional badge label */
  badge?: string
  /** Tailwind class for icon color. Not applied when iconVariant is "custom". */
  iconColorClass?: string
  /** Tailwind class for icon container background. Not applied when iconVariant is "custom". */
  iconBgClass?: string
  /** When "custom", icon is rendered without color/size overrides */
  iconVariant?: "default" | "custom"
  /** Priority loading for above-the-fold images */
  priority?: boolean
}

export interface BentoGridSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Override the default items */
  items?: BentoItem[]
}
