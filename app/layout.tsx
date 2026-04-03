import type { Metadata } from "next";
import { baseMetadata } from "@/lib/metadata";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/navbar/header";
import { Footer } from "@/components/footer";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  ...baseMetadata,
  title: {
    default: "SEU CampusMate - Academic Companion for Southeast University",
    template: "%s | SEU CampusMate",
  },
  description:
    "Track attendance, calculate CGPA, manage routines, and stay connected with your SEU community. Everything you need for academic success.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={
        {
          "--font-sans":
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          "--font-geist-sans":
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          "--font-geist-mono":
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        } as Record<string, string>
      }
    >
      <head />
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              {!isAdmin && <Header />}
              <main className={`flex-1 ${!isAdmin ? 'pt-14 md:pt-16' : ''}`}>
                {children}
              </main>
              {!isAdmin && <Footer />}
            </div>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
