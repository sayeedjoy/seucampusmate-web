import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="w-full py-16 md:py-24">
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="mb-8">
            Sorry, the page you are looking for does not exist.
          </p>
          <Button asChild className="not-prose mt-6">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}