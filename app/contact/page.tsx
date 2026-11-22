import { Container } from "@/components/ui/container";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/site.config";
import { Mail, Phone, MapPin, Github } from "lucide-react";

export const metadata = createPageMetadata("contact");

export default function ContactPage() {
  const { business, social } = siteConfig;

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Questions, feedback, or need help with your subscription? We&apos;re here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href={`mailto:${business.supportEmail}`}
            className="group flex items-start gap-4 rounded-xl border bg-card p-6 transition-colors hover:border-primary/50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">Email</span>
              <span className="block text-sm text-muted-foreground group-hover:text-primary">
                {business.supportEmail}
              </span>
            </span>
          </a>

          <div className="flex items-start gap-4 rounded-xl border bg-card p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">Phone</span>
              <span className="block text-sm text-muted-foreground">{business.phone}</span>
            </span>
          </div>

          <div className="flex items-start gap-4 rounded-xl border bg-card p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">Address</span>
              <span className="block text-sm text-muted-foreground">{business.address}</span>
            </span>
          </div>

          <a
            href={social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-xl border bg-card p-6 transition-colors hover:border-primary/50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Github className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">GitHub</span>
              <span className="block text-sm text-muted-foreground group-hover:text-primary">
                Report an issue or contribute
              </span>
            </span>
          </a>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          For billing and refund questions, please include the email address used for your
          purchase. See our{" "}
          <a href="/refund-policy" className="text-primary hover:underline">
            Refund Policy
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
