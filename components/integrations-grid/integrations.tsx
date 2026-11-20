"use client"

import * as React from "react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/section-header"
import { ChevronDown, ChevronUp } from "lucide-react"
import { IntegrationCard } from "./integration-card"
import { integrations } from "./integrations-data"

const INITIAL_VISIBLE = 8

export function IntegrationsSection2() {
  const [expanded, setExpanded] = React.useState(false)
  const visibleItems = expanded ? integrations : integrations.slice(0, INITIAL_VISIBLE)
  const hasMore = integrations.length > INITIAL_VISIBLE

  const toggle = hasMore ? (
    <Button
      variant="outline"
      onClick={() => setExpanded((e) => !e)}
      aria-expanded={expanded}
      aria-controls="toolkit-grid"
      className="gap-1.5"
    >
      {expanded ? "Show fewer tools" : `Show all ${integrations.length} tools`}
      {expanded ? <ChevronUp className="size-4" aria-hidden /> : <ChevronDown className="size-4" aria-hidden />}
    </Button>
  ) : null

  return (
    <section id="features" aria-labelledby="toolkit-title" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
      <Container className="max-w-[90rem]">
        <SectionHeader
          id="toolkit-title"
          eyebrow="Tools"
          title="The SEU student toolkit"
          description="Calculators, routines and course references, set up for Southeast University."
          action={<div className="hidden sm:block">{toggle}</div>}
        />

        <ul id="toolkit-grid" className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {visibleItems.map((item) => (
            <li key={item.id} className="flex">
              <IntegrationCard integration={item} />
            </li>
          ))}
        </ul>

        {/* On phones the toggle follows the list, where the thumb already is */}
        {toggle ? <div className="mt-6 sm:hidden [&_button]:w-full">{toggle}</div> : null}
      </Container>
    </section>
  )
}
