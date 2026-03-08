"use client"

import * as React from "react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { IntegrationCard } from "./integration-card"
import { integrations } from "./integrations-data"
import { AuroraText } from "../ui/aurora-text"

const INITIAL_VISIBLE = 8

export function IntegrationsSection2() {
  const [expanded, setExpanded] = React.useState(false)
  const visibleItems = expanded ? integrations : integrations.slice(0, INITIAL_VISIBLE)
  const hasMore = integrations.length > INITIAL_VISIBLE

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container>
        {/* Header */}
        <div className="mx-auto mb-12 w-full max-w-2xl text-center sm:mb-16 lg:flex lg:flex-col lg:items-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:whitespace-nowrap md:text-6xl lg:text-7xl">
            The Ultimate <AuroraText>SEU</AuroraText> Student Toolkit
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Key tools and resources to power your journey at Southeast University.
          </p>
        </div>

        {/* Grid: 4 columns × 3 rows */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 sm:gap-5 lg:gap-6">
          {visibleItems.map((item) => (
            <IntegrationCard key={item.id} integration={item} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExpanded((e) => !e)}
              className="gap-1.5"
            >
              {expanded ? (
                <>
                  Show less
                  <ChevronUp className="size-4" />
                </>
              ) : (
                <>
                  Show more
                  <ChevronDown className="size-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </Container>
    </section>
  )
}
