import Image from "next/image"
import { Container } from "@/components/ui/container"

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.apppulse.seu&hl=en"

export default function CTASection() {
  return (
    <section aria-labelledby="cta-title" className="pb-16 sm:pb-20 lg:pb-24">
      <Container className="max-w-[90rem]">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/40 p-8 sm:p-10 lg:p-14">
          {/* The hero's dot grid, fading in from the right, so the page closes the way it opened */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "radial-gradient(ellipse 60% 90% at 100% 50%, #000 30%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 90% at 100% 50%, #000 30%, transparent 100%)",
            }}
            aria-hidden
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-wide text-amber-600 dark:text-amber-400">Get the app</p>
              <h2
                id="cta-title"
                className="mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl"
              >
                Take CampusMate to class.
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Your routine, attendance, marks and CGPA on your Android phone.
              </p>
            </div>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block shrink-0 self-start rounded-[10px] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:self-center"
              aria-label="Get CampusMate on Google Play (opens in a new tab)"
            >
              <Image
                src="/google-play.webp"
                alt=""
                width={180}
                height={54}
                className="h-14 w-auto object-contain"
                style={{ width: "auto" }}
              />
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
