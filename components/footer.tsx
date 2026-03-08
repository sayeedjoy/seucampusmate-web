'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { siteConfig } from '@/site.config';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { motion } from 'motion/react';
import { Github, ArrowUpRight } from 'lucide-react';

const socialLinks = [
    {
        href: siteConfig.social.github,
        label: 'GitHub',
        icon: Github,
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
};

export function Footer() {
    const currentYear = new Date().getFullYear();
    const prefersReducedMotion = useReducedMotion();

    const MotionDiv = prefersReducedMotion ? 'div' : motion.div;

    return (
        <footer className="relative bg-background">


            <Container>
                <MotionDiv
                    {...(!prefersReducedMotion && {
                        variants: containerVariants,
                        initial: 'hidden',
                        whileInView: 'visible',
                        viewport: { once: true, amount: 0.15 },
                    })}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 py-16 lg:py-20"
                >
                    {/* Brand Column */}
                    <MotionDiv
                        {...(!prefersReducedMotion && { variants: itemVariants })}
                        className="lg:col-span-5"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Image
                                src="/logo.webp"
                                alt={`${siteConfig.name} Logo`}
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                    {siteConfig.name}
                                </h2>
                                <p className="text-xs tracking-wide text-muted-foreground/70">
                                    {siteConfig.tagline}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-8">
                            Your comprehensive platform for academic success at Southeast University.
                            Manage your studies, track progress, and connect with the community.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-200 cursor-pointer"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                                </a>
                            ))}
                        </div>
                    </MotionDiv>

                    {/* Quick Links Column */}
                    <MotionDiv
                        {...(!prefersReducedMotion && { variants: itemVariants })}
                        className="lg:col-span-3"
                    >
                        <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {siteConfig.quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        <span>{link.label}</span>
                                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </MotionDiv>

                    {/* Support Column */}
                    <MotionDiv
                        {...(!prefersReducedMotion && { variants: itemVariants })}
                        className="lg:col-span-2"
                    >
                        <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
                            Support
                        </h3>
                        <ul className="space-y-3">
                            {siteConfig.supportLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        <span>{link.label}</span>
                                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </MotionDiv>

                    {/* Legal Column */}
                    <MotionDiv
                        {...(!prefersReducedMotion && { variants: itemVariants })}
                        className="lg:col-span-2"
                    >
                        <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/privacy"
                                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                >
                                    <span>Privacy Policy</span>
                                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                >
                                    <span>Terms of Service</span>
                                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                                </Link>
                            </li>
                        </ul>
                    </MotionDiv>
                </MotionDiv>

                {/* Bottom Bar */}
                <div className="border-t border-border py-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-center sm:text-left">
                        <p className="text-xs text-muted-foreground/60">
                            &copy; {currentYear} {siteConfig.name}. All rights reserved.
                        </p>
                        <p className="text-xs text-muted-foreground/40">
                            Built by SEU students, for SEU students.
                        </p>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
