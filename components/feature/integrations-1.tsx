'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { AuroraText } from '@/components/ui/aurora-text'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { features } from './feature-data'

const INITIAL_VISIBLE = 8
const defaultLink = 'https://github.com/meschacirung/cnblocks'

export default function IntegrationsSection() {
    const [expanded, setExpanded] = React.useState(false)
    const visibleItems = expanded ? features : features.slice(0, INITIAL_VISIBLE)
    const hasMore = features.length > INITIAL_VISIBLE

    return (
        <section id="features">
            <div className="py-12 md:py-20 lg:py-32">
                <Container className="py-0">
                    <div className="text-center">
                        <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-bold">Everything You Need as an <AuroraText>SEU Student</AuroraText></h2>
                        <p className="text-muted-foreground mt-6">Essential tools and resources to enhance your academic journey at Southeast University.</p>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {visibleItems.map((item) => {
                            const IconComponent = item.icon
                            return (
                                <IntegrationCard
                                    key={item.title}
                                    title={item.title}
                                    description={item.description}
                                    link={item.link ?? defaultLink}>
                                    <IconComponent className="size-10" />
                                </IntegrationCard>
                            )
                        })}
                    </div>

                    {hasMore && (
                        <div className="mt-6 flex justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpanded((e) => !e)}
                                className="gap-1.5">
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
            </div>
        </section>
    )
}

const IntegrationCard = ({ title, description, children, link = 'https://github.com/meschacirung/cnblocks' }: { title: string; description: string; children: React.ReactNode; link?: string }) => {
    return (
        <Card className="p-6">
            <div className="relative">
                <div className="*:size-10">{children}</div>

                <div className="space-y-2 py-6">
                    <h3 className="text-base font-medium">{title}</h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
                </div>

                <div className="flex gap-3 border-t border-dashed pt-6">
                    <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="gap-1 pr-2 shadow-none">
                        <Link href={link}>
                            Use Tool
                            <ChevronUp className="ml-0 !size-3.5 opacity-50" />
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    )
}
