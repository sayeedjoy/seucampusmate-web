import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  /** Short label above the title, in the hero's amber. */
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  /** Optional control on the right, aligned to the title's baseline row. */
  action?: ReactNode
  /** id for the h2, so the section can reference it with aria-labelledby. */
  id?: string
  className?: string
}

/**
 * The homepage's section header. Left-aligned on the same edge as the hero
 * copy and one step below the hero's h1, so the hero stays the loudest thing
 * on the page and every section after it reads in the same order.
 */
export function SectionHeader({ eyebrow, title, description, action, id, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-amber-600 dark:text-amber-400">{eyebrow}</p>
        <h2
          id={id}
          className="mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
