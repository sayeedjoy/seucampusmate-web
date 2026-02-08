"use client";
import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/navbar/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/navbar/mobile-nav";

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

	return (
		<header
			className={cn(
				"sticky top-0 z-50 mx-auto w-full max-w-4xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
				{
					"border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:shadow":
						scrolled,
				}
			)}
		>
			<nav
				className={cn(
					"flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
					{
						"md:px-2": scrolled,
					}
				)}
			>
				<a className="rounded-md p-2 hover:bg-accent" href="#">
					<Logo className="h-4.5" />
				</a>
				<div className="hidden items-center gap-1 md:flex">
					{navLinks.map((link, i) => (
						<a
							className={buttonVariants({ variant: "ghost" })}
							href={link.href}
							key={i}
						>
							{link.label}
						</a>
					))}
					<Button variant="outline">Sign In</Button>
					<Button>Get Started</Button>
				</div>
				<MobileNav />
			</nav>
		</header>
	);
}
