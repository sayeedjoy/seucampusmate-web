import { Hero } from "@/components/hero";
import IntegrationsSection from "@/components/feature/integrations-1";
import StatsSection from "@/components/stats";
import { BentoGridSection } from "@/components/bento";
import { Container } from "@/components/ui/container";
import Testimonials from "@/components/testimonials";

export default function Page() {
  return (
    <>
      <Hero />
      <IntegrationsSection />
      <BentoGridSection />
      <StatsSection />
      <section className="w-full py-16 md:py-24">
        <Container>
          <Testimonials/>
        </Container>
      </section>
    </>
  );
}