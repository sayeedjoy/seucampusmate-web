import { Container } from "@/components/ui/container";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/site.config";

export const metadata = createPageMetadata("refundPolicy");

export default function RefundPolicyPage() {
  const { business } = siteConfig;

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Refund Policy</h1>
          <p className="text-xl text-muted-foreground">
            Cancellation and refund terms for CampusMate Premium.
          </p>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <section className="rounded-xl border bg-card p-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Overview</h2>
            <p className="text-muted-foreground">
              CampusMate Premium is a recurring subscription. Payments are processed by
              Paddle.com, our Merchant of Record, who also handles refunds on our behalf.
              This policy explains when you are eligible for a refund and how to request one.
            </p>
          </section>

          <section className="rounded-xl border bg-card p-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Cancellations</h2>
            <p className="mb-3 text-muted-foreground">
              You can cancel your subscription at any time from your account or by
              contacting us. When you cancel:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Your subscription will not renew for the next billing period.</li>
              <li>• You keep Premium access until the end of the current paid period.</li>
              <li>• No further charges are made after cancellation takes effect.</li>
            </ul>
          </section>

          <section className="rounded-xl border bg-card p-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Refund eligibility</h2>
            <p className="mb-3 text-muted-foreground">
              We offer a <strong>{business.refundWindowDays}-day refund window</strong> from
              the date of your initial purchase or renewal. To be eligible:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• The refund must be requested within the window stated above.</li>
              <li>• The request must come from the account holder who made the purchase.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Approved refunds are returned to the original payment method. Processing times
              depend on your bank or card provider.
            </p>
          </section>

          <section className="rounded-xl border bg-card p-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Non-refundable cases</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Requests made after the refund window has passed.</li>
              <li>• Partial or unused time in a billing period after the window.</li>
              <li>• Accounts suspended or terminated for violating our Terms of Service.</li>
            </ul>
          </section>

          <section className="rounded-xl border bg-card p-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">How to request a refund</h2>
            <p className="text-muted-foreground">
              Email us at{" "}
              <span className="font-medium text-foreground">{business.supportEmail}</span>{" "}
              with the email address used for the purchase and your order or receipt ID
              (included in the confirmation email from Paddle). We&apos;ll respond within a
              reasonable timeframe. You may also contact Paddle directly through the receipt
              they send you.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
