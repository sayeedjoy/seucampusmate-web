"use client";
import { useTheme } from "next-themes";
import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/navbar/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/navbar/mobile-nav";
import { MoonIcon, SunIcon } from "lucide-react";

export const navLinks = [
	{
		label: "Features",
		href: "#",
	},
	{
		label: "Pricing",
		href: "#",
	},
	{
		label: "About",
		href: "#",
	},
];

export function Header() {
	const scrolled = useScroll(10);
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full border-b border-transparent transition-all duration-200 ease-out",
				scrolled && "border-border bg-background/95 shadow-sm supports-[backdrop-filter]:bg-background/80 backdrop-blur-md"
			)}
		>
			<nav className="flex h-14 md:h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="mx-auto flex h-full w-full max-w-[90rem] items-center justify-between">
					<Logo className="rounded-lg py-2 pr-2 -ml-2 hover:bg-accent/50 transition-colors" />
					<div className="hidden items-center gap-0.5 md:flex">
						{navLinks.map((link, i) => (
							<a
								className={buttonVariants({ variant: "ghost", className: "text-sm font-medium text-muted-foreground hover:text-foreground" })}
								href={link.href}
								key={i}
							>
								{link.label}
							</a>
						))}
						<div className="ml-2 flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="relative text-muted-foreground hover:text-foreground"
								onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
								aria-label="Toggle theme"
							>
								<SunIcon className="size-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
								<MoonIcon className="absolute size-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							</Button>
							<Button variant="ghost" className="text-muted-foreground hover:text-foreground">
								Sign In
							</Button>
							<Button>Get Started</Button>
						</div>
					</div>
					<MobileNav />
				</div>
			</nav>
		</header>
	);
}
