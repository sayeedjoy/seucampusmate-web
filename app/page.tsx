import { Hero } from "@/components/hero";
import { BentoGridSection } from "@/components/bento-grid/bento";
import Testimonials from "@/components/testimonials";
import { createPageMetadata } from "@/lib/metadata";
import { IntegrationsSection2 } from "@/components/integrations-grid/integrations";
import CTASection from "@/components/cta-sections-01";
export const metadata = createPageMetadata("home");

export default function Page() {
  return (
    <>
      <Hero />
      <IntegrationsSection2 />
      <BentoGridSection />
      <Testimonials />
      <CTASection />
    </>
  );
}
