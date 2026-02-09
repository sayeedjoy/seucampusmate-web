import { Hero } from "@/components/hero";
import IntegrationsSection from "@/components/feature/integrations-1";
import StatsSection from "@/components/stats";
import { BentoGridSection } from "@/components/bento-grid/bento";
import { Container } from "@/components/ui/container";
import Testimonials from "@/components/testimonials";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata("home");

export default function Page() {
  return (
    <>
      <Hero />
      <IntegrationsSection />
      <BentoGridSection />
      <StatsSection />
      <section className="w-full pt-4 pb-10 md:pt-8 md:pb-24">
        <Container>
          <Testimonials/>
        </Container>
      </section>
    </>
  );
}