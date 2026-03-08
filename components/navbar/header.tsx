"use client";
import { useTheme } from "next-themes";
import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/navbar/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/navbar/mobile-nav";
import { GitHubStars } from "@/components/github-stars";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";


interface NavLink {
	label: string;
	href: string;
	isNew?: boolean;
}
export const navLinks = [
	{ label: "Home", href: "/" },
	{ label: "Features", href: "/#features" },
	{ label: "Resume Builder", href: "/tools/resume-builder", isNew: true },
	{ label: "CP Leaderboard", href: "/cp" },
	{ label: "About", href: "/about" },
	{ label: "Contact", href: "/contact" },
];

export function Header() {
	const scrolled = useScroll(10);
	const { setTheme } = useTheme();

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 w-full border-b border-transparent bg-background/90 backdrop-blur-sm transition-all duration-200 ease-out supports-[backdrop-filter]:bg-background/80",
				scrolled && "border-border bg-background/95 shadow-sm backdrop-blur-md"
			)}
		>
			<nav className="flex h-14 md:h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="relative mx-auto flex h-full w-full max-w-[90rem] items-center justify-between">
					<Logo className="rounded-lg py-2 pr-2 -ml-2 hover:bg-accent/50 transition-colors" />
					<div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex">
						{navLinks.map((link, i) => (
							<a
								className={buttonVariants({ variant: "ghost", className: "text-sm font-medium text-muted-foreground hover:text-foreground" })}
								href={link.href}
								key={i}
							>
								{link.label}

								{link.isNew && (
									<span className="ml-2 rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-bold text-green-600 animate-pulse border border-green-500/20">
                                      NEW
                                    </span>
								)}

							</a>
						))}
					</div>
					<div className="flex items-center gap-2">
						<div className="hidden md:flex md:items-center md:gap-2">
							<GitHubStars
								repo={process.env.NEXT_PUBLIC_GITHUB_REPO ?? "sayeedjoy/seucampusmate-web"}
							/>
							<AnimatedThemeToggler
								className={cn(
									"inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
								)}
								onThemeChange={setTheme}
							/>
						</div>
						<MobileNav />
					</div>
				</div>
			</nav>
		</header>
	);
}
