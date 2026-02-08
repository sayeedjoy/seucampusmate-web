import Link from "next/link";
import type { ComponentProps } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";

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

const Testimonials = () => (
  <div className="flex min-h-0 items-center justify-center py-8 md:py-12">
    <div className="h-full w-full overflow-hidden">
      <h2 className="text-pretty px-6 text-center font-semibold text-3xl sm:text-4xl md:text-5xl tracking-[-0.03em]">
        What our users say
      </h2>
      <p className="mt-3 text-center text-muted-foreground text-xl">
        See what our users have to say about CampusMate
      </p>
      <div className="relative mt-8 md:mt-14 overflow-hidden">
        <div className="absolute inset-y-0 left-0 z-10 w-[15%] bg-linear-to-r from-background to-transparent" />
        <div className="absolute inset-y-0 right-0 z-10 w-[15%] bg-linear-to-l from-background to-transparent" />
        <Marquee className="[--duration:20s]" pauseOnHover>
          <TestimonialList />
        </Marquee>
        <Marquee className="mt-0 [--duration:20s]" pauseOnHover reverse>
          <TestimonialList />
        </Marquee>
      </div>
    </div>
  </div>
);

const TestimonialList = () =>
  testimonials.map((testimonial) => (
    <div
      className="min-w-[280px] sm:min-w-96 max-w-sm rounded-xl bg-accent p-6"
      key={testimonial.id}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={testimonial.avatar.trim()} alt={testimonial.name} />
            <AvatarFallback className="bg-primary font-medium text-primary-foreground text-xl">
              {testimonial.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-gray-500 text-sm">{testimonial.designation}</p>
          </div>
        </div>
      </div>
      <p className="mt-5 text-[17px]">{testimonial.testimonial}</p>
    </div>
  ));

export default Testimonials;
