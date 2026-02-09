import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"
import { BentoGrid } from "./bento-grid"
import { BentoCard } from "./bento-card"
import { BENTO_ITEMS } from "./bento-items"
import type { BentoGridSectionProps } from "./types"

const BentoGridSection = React.forwardRef<HTMLElement, BentoGridSectionProps>(
  ({ className, items = BENTO_ITEMS, ...props }, ref) => (
    <section
      ref={ref}
      className={cn("w-full py-10 md:py-16 lg:py-24", className)}
      {...props}
    >
      <Container>
        <div className="mb-8 text-center md:mb-12">
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
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
              image={item.image}
              title={item.title}
              description={item.description}
              icon={item.icon}
              badge={item.badge}
              iconColorClass={item.iconColorClass}
              iconBgClass={item.iconBgClass}
              iconVariant={item.iconVariant}
            />
          ))}
        </BentoGrid>
      </Container>
    </section>
  )
)
BentoGridSection.displayName = "BentoGridSection"

export { BentoGridSection }
