import { Hero } from "@/components/hero";
import IntegrationsSection from "@/components/feature/integrations-1";
import StatsSection from "@/components/stats";
import { BentoGridSection } from "@/components/bento";

export default function Page() {
  return (
    <>
      <Hero />
      <IntegrationsSection />
      <BentoGridSection />
      <StatsSection />
    </>
  );
}