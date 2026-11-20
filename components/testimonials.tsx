import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { Marquee } from "@/components/ui/marquee";
import { SectionHeader } from "@/components/section-header";

const testimonials = [
  {
    id: 1,
    name: "Shagupta Kabir",
    designation: "Student",
    company: "",
    testimonial: "What an useful app.Thanks to the creator",
    avatar: "https://play-lh.googleusercontent.com/a-/ALV-UjUlH-NKjbuXkL47cEYBs-FdEW1d6Q-8QDMYZWYpJqdf7knReGbB=s32-rw",
  },
  {
    id: 2,
    name: "niladdry ghosh",
    designation: "Student",
    company: "",
    testimonial: "Too good and helpful for students❤️ Thanks for this initiative🤘",
    avatar: "https://play-lh.googleusercontent.com/a-/ALV-UjX-V3Gz211vBych8Cp0RedeEXNgyTCb2RUlfT3EcDMEa1fu10J4AA=s32-rw",
  },
  {
    id: 3,
    name: "Sajib Mahmud",
    designation: "Student",
    company: "",
    testimonial: "Its very helpful app and very easy to calculate every necessary steps. Highly recommend for the Southeast students.👌👌🫰🫰❤️",
    avatar: "https://play-lh.googleusercontent.com/a-/ALV-UjWR5AmVEw47KeReXbJ5_P-v_u_qUckDgs5LPA5LGmfJZXWDleJ-bA=s32-rw",
  },
  {
    id: 4,
    name: "Munim Mubassir",
    designation: "Student",
    company: "",
    testimonial: "Great application!! Its student friendly and very helpful for the students. I suggest this application to the users.",
    avatar: "https://play-lh.googleusercontent.com/a-/ALV-UjXjupWPh7QCtBa8bMexoYYj5QrTBhRil1GgTGxv-Mqe-o1Dm6k=s32-rw",
  },
  {
    id: 5,
    name: "Rezwon Ahmed",
    designation: "Student",
    company: "",
    testimonial: "As a student of southeast university, I obviously recommend this apps for all the students of this University!",
    avatar: "https://play-lh.googleusercontent.com/a-/ALV-UjUATfIXHFGscbp7e4SprTFJ3cM5jBbBTjE2AgFtGtuzeLbOkOz-=s32-rw",
  },
  {
    id: 6,
    name: "Thashin Islam Himel",
    designation: "Student",
    company: "",
    testimonial: "Very helpful app. Please add comments your problem option this app",
    avatar: "https://play-lh.googleusercontent.com/a/ACg8ocK3POvp9U9zhwNF_Qx5HqRfI9Zg3DQj8g7vE0lIGQRjndIBUA=s32-rw-mo",
  },
];

const STATS = [
  { value: "10K+", label: "downloads" },
  { value: "7K+", label: "active users" },
  { value: "4.9", label: "Play Store rating" },
];

const Testimonials = () => (
  <section aria-labelledby="reviews-title" className="w-full py-16 sm:py-20 lg:py-24">
    <Container className="max-w-[90rem]">
      <SectionHeader
        id="reviews-title"
        eyebrow="Reviews"
        title="What SEU students say"
        description="From CampusMate's reviews on Google Play."
        action={
          <dl className="flex gap-8 sm:gap-10">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
                <dd className="text-3xl font-bold tracking-[-0.02em] text-foreground tabular-nums sm:text-4xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        }
      />
    </Container>

    {/* The reel runs edge to edge; the fades keep its ends soft */}
    <div className="relative overflow-hidden motion-reduce:[&_.animate-marquee]:[animation-play-state:paused]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[12%] bg-linear-to-r from-background to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[12%] bg-linear-to-l from-background to-transparent" aria-hidden />
      <Marquee className="[--duration:40s]" pauseOnHover>
        <TestimonialList />
      </Marquee>
      <Marquee className="[--duration:40s]" pauseOnHover reverse>
        <TestimonialList />
      </Marquee>
    </div>
  </section>
);

const TestimonialList = () =>
  testimonials.map((testimonial) => (
    <figure
      className="flex w-[300px] flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6 sm:w-[380px]"
      key={testimonial.id}
    >
      <blockquote className="text-pretty text-[15px] leading-relaxed text-foreground sm:text-base">
        {testimonial.testimonial}
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage src={testimonial.avatar.trim()} alt="" className="object-cover" />
          <AvatarFallback className="bg-muted text-sm font-medium text-foreground">
            {testimonial.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold capitalize text-foreground">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.designation}</p>
        </div>
      </figcaption>
    </figure>
  ));

export default Testimonials;
