import type { Metadata } from "next";
import Team from "@/components/team";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the team behind SEU CampusMate and learn how you can contribute.",
};

export default function AboutPage() {
  return (
    <>
      <Team />
      <Container className="flex flex-col items-center justify-center py-12">
        <p className="mb-4 text-center text-muted-foreground">
          This is an open source project — contribute to make it better.
        </p>
        <a
          href="https://github.com/sayeedjoy/seucampusmate-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ShimmerButton>Contribute now</ShimmerButton>
        </a>
      </Container>
    </>
  );
}
