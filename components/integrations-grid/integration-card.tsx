import { ArrowUpRight } from "lucide-react"
import type { Integration } from "./types"

export function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 transition-shadow hover:shadow-md">
      {/* Icon */}
      <div className="mb-4 shrink-0">{integration.icon}</div>

      {/* Name */}
      <h3 className="text-base font-semibold text-foreground">
        {integration.name}
      </h3>

      {/* Description */}
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
        {integration.description}
      </p>

      {/* Connect button */}
      <div className="mt-5">
        <a
          href={integration.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          Connect
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </div>
  )
}
