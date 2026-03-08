import { Hero } from "@/components/hero";
import StatsSection from "@/components/stats";
import { BentoGridSection } from "@/components/bento-grid/bento";
import { Container } from "@/components/ui/container";
import Testimonials from "@/components/testimonials";
import { createPageMetadata } from "@/lib/metadata";
import { IntegrationsSection2 } from "@/components/integrations-grid/integrations";
import CTASection from "@/components/cta-sections-01";
export const metadata = createPageMetadata("home");

export default function Page() {
  return (
    <>
      <Hero />
      <IntegrationsSection2/>
      <BentoGridSection />
      <StatsSection />
      <section className="w-full pt-4 pb-10 md:pt-8 md:pb-24">
        <Container>
          <Testimonials/>
        </Container>
      </section>
      <CTASection/>
    </>
  );
}