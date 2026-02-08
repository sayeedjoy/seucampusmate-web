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
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors" aria-label="Facebook">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors" aria-label="LinkedIn">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors" aria-label="GitHub">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                            <a href="mailto:contact@campusmate.com" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors" aria-label="Email">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
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
