import { Container } from "@/components/ui/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createPageMetadata } from "@/lib/metadata";
import { PricingPlans } from "@/components/premium/PricingPlans";

export const metadata = createPageMetadata("pricing");

const FAQ = [
  {
    q: "Is CampusMate free to use?",
    a: "Yes. All core tools — CGPA and tuition calculators, exam routine search, academic calendar, blood donors, CP leaderboard and hackathons — are free forever. Premium removes usage limits and unlocks extra features.",
  },
  {
    q: "What does Premium include?",
    a: "Unlimited resume builder and cover page PDF exports, unlimited AI assistant messages, unlimited assessment tracking, exam routine PDF export, and priority access to new tools.",
  },
  {
    q: "How am I billed, and who processes payment?",
    a: "Premium is a recurring subscription (monthly or yearly) processed by Paddle.com, our Merchant of Record. Paddle handles payment, invoicing and applicable taxes. Your subscription renews automatically until you cancel.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time; you'll keep Premium access until the end of the current billing period. See our Refund Policy for refund eligibility.",
  },
];

export default function PricingPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">
            Simple, student-friendly pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Start free and upgrade when you need unlimited exports and tools. No
            hidden fees — cancel anytime.
          </p>
        </div>

        <PricingPlans />

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Container>
  );
}
