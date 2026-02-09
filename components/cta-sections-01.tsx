import Image from "next/image"

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.apppulse.seu&hl=en"

export default function CTASection() {
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="bg-muted/50 flex w-full flex-col gap-6 rounded-lg p-8 md:rounded-xl lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="flex-1">
            <h3 className="font-heading mb-4 text-balance text-2xl font-bold sm:text-3xl md:text-4xl">
              Download our app
            </h3>
            <p className="text-muted-foreground text-balance text-base lg:text-lg">
              Get CampusMate on Android.
            </p>
          </div>
          <div className="flex shrink-0">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block min-h-[44px] min-w-[152px] rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Download CampusMate on Google Play"
            >
              <Image
                src="/google-play.webp"
                alt="Get it on Google Play"
                width={180}
                height={54}
                className="h-11 w-auto object-contain sm:h-12 md:h-14 lg:h-16"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
