'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/container';

const quickLinks = [
    { href: '/tools/cgpa-calculator', label: 'CGPA Calculator' },
    { href: '/tools/attendance-calculator', label: 'Attendance Tracker' },
    { href: '/tools/question-bank', label: 'Question Bank' },
    { href: '/tools/assessment-tracking', label: 'Assessment Tracking' },
    { href: '/coverpage', label: 'Cover Page Generator' },
];

const supportLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/contact', label: 'Help Center' },
    { href: '/contact', label: 'Feedback' },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-background">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 py-12 lg:py-16">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                            <Image
                                src="/logo.webp"
                                alt="CampusMate Logo"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                                    SEU CampusMate
                                </h2>
                                <p className="text-sm lg:text-base text-muted-foreground">
                                    Your Academic Companion
                                </p>
                            </div>
                        </div>
                        <p className="text-sm lg:text-base text-muted-foreground mb-6 max-w-md leading-relaxed">
                            Your comprehensive platform for academic success at Southeast University. Manage your studies, track progress, and connect with the community.
                        </p>
                        <div className="flex items-center gap-2">
                            <a href="https://github.com/sayeedjoy/seucampusmate-web" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors" aria-label="GitHub">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-base lg:text-lg font-semibold text-foreground mb-5">Quick Links</h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm lg:text-base text-muted-foreground hover:text-foreground hover:underline transition-colors">{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-base lg:text-lg font-semibold text-foreground mb-5">Support</h3>
                        <ul className="space-y-3">
                            {supportLinks.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm lg:text-base text-muted-foreground hover:text-foreground hover:underline transition-colors">{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="py-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-center sm:text-left">
                        <p className="text-sm lg:text-base text-muted-foreground">© {currentYear} SEU CampusMate. All rights reserved.</p>
                        <div className="flex justify-center sm:justify-start gap-6 text-sm lg:text-base">
                            <Link href="/privacy" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
