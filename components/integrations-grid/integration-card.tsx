import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Integration } from "./types"

const buttonClass = "inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"

export function IntegrationCard({ integration }: { integration: Integration }) {
  const isInternal = integration.href.startsWith("/")
  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 shrink-0">{integration.icon}</div>
      <h3 className="text-base font-semibold text-foreground">
        {integration.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
        {integration.description}
      </p>
      <div className="mt-5">
        {isInternal ? (
          <Link href={integration.href} className={buttonClass}>
            Use Now
            <ArrowUpRight className="size-3.5" />
          </Link>
        ) : (
          <a href={integration.href} className={buttonClass}>
            Use Now
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
