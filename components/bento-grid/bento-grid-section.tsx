import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"
import { SectionHeader } from "@/components/section-header"
import { FeatureBento } from "./feature-bento"
import type { BentoGridSectionProps } from "./types"

const BentoGridSection = React.forwardRef<HTMLElement, BentoGridSectionProps>(
  ({ className, ...props }, ref) => (
    <section
      ref={ref}
      id="app"
      aria-labelledby="app-title"
      className={cn("w-full scroll-mt-20 py-16 sm:py-20 lg:py-24", className)}
      {...props}
    >
      <Container className="max-w-[90rem]">
        <SectionHeader
          id="app-title"
          eyebrow="In the app"
          title="Your semester, in your pocket"
          description="Today's classes, the marks you still need, tasks, exam slips and fees, all in the CampusMate app."
        />

        <FeatureBento />
      </Container>
    </section>
  )
)
BentoGridSection.displayName = "BentoGridSection"

export { BentoGridSection }
