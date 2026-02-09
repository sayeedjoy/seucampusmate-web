import { Container } from "@/components/ui/container";
import { IntegrationCard } from "./integration-card";
import { integrations } from "./integrations-data";

export function IntegrationsSection2() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container>
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          The Ultimate SEU Student Toolkit
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Key tools and resources to power your journey at Southeast University.
          </p>
        </div>

        {/* Grid: 4 columns × 3 rows */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 sm:gap-5 lg:gap-6">
          {integrations.map((item) => (
            <IntegrationCard key={item.id} integration={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
