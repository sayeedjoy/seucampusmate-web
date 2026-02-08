import { Header } from "@/components/navbar/header";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import IntegrationsSection from "@/components/feature/integrations-1";
import StatsSection from "@/components/stats";
import { BentoGridSection } from "@/components/bento";
export default function Page() {
  return (
    <>
      <Header />
      <Hero />
      <IntegrationsSection />
      <BentoGridSection/>
      <StatsSection/>
      <Footer />
    </>
  );
}