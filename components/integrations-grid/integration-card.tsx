import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import type { Integration } from "./types"

// The whole card is the link: one large target instead of a small pill
// repeated on every card. The arrow shows where it goes (in-site or out).
const cardClass =
  "group relative flex w-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-6"

export function IntegrationCard({ integration }: { integration: Integration }) {
  const isInternal = integration.href.startsWith("/")
  const isNew = integration.id === 0
  const Arrow = isInternal ? ArrowRight : ArrowUpRight

  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="shrink-0">{integration.icon}</div>
        <Arrow
          className="size-5 text-muted-foreground transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </div>

      <h3 className="mt-5 flex items-center gap-2 text-base font-semibold text-foreground">
        {integration.name}
        {isNew && (
          <span className="rounded-full border border-green-500/25 bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
            New
          </span>
        )}
      </h3>

      <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">{integration.description}</p>
    </>
  )

  return isInternal ? (
    <Link href={integration.href} className={cardClass}>
      {body}
    </Link>
  ) : (
    <a href={integration.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
      {body}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
