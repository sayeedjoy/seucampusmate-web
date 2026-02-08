/**
 * Page Registry - Type-safe page registration system for scalable page management
 * 
 * This system provides:
 * - Centralized page configuration
 * - Type-safe metadata generation
 * - Validation for new pages
 * - Sitemap generation support
 */

import type { Metadata } from 'next';
import { baseMetadata } from '../metadata';

/**
 * Configuration for a page in the application
 */
export interface PageConfig {
    /** Unique identifier for the page */
    key: string;
    /** SEO title for the page */
    title: string;
    /** SEO description for the page */
    description: string;
    /** URL path (e.g., '/tools/cgpa-calculator') */
    path: string;
    /** Optional custom OG image path */
    ogImage?: string;
    /** Type of structured data to generate */
    structuredDataType?: 'tool' | 'article' | 'webpage';
    /** ISR revalidation time in seconds, or false for no revalidation */
    revalidate?: number | false;
    /** Change frequency for sitemap */
    changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    /** Priority for sitemap (0.0 to 1.0) */
    priority?: number;
}

// Internal registry storage
const pageRegistry = new Map<string, PageConfig>();

/**
 * Register a new page configuration
 * Throws an error if required fields are missing
 */
export function registerPage(config: PageConfig): PageConfig {
    // Validate required fields
    if (!config.key) {
        throw new Error('Page config must have a key');
    }
    if (!config.title) {
        throw new Error(`Page "${config.key}" must have a title`);
    }
    if (!config.description) {
        throw new Error(`Page "${config.key}" must have a description`);
    }
    if (!config.path) {
        throw new Error(`Page "${config.key}" must have a path`);
    }

    // Validate path format
    if (!config.path.startsWith('/')) {
        throw new Error(`Page "${config.key}" path must start with /`);
    }

    // Warn if overwriting existing registration
    if (pageRegistry.has(config.key)) {
        console.warn(`Page "${config.key}" is being re-registered. This may be intentional during development.`);
    }

    pageRegistry.set(config.key, config);
    return config;
}

/**
 * Get a page configuration by key
 */
export function getPageConfig(key: string): PageConfig | undefined {
    return pageRegistry.get(key);
}

/**
 * Get all registered pages
 */
export function getAllPages(): PageConfig[] {
    return Array.from(pageRegistry.values());
}

/**
 * Generate Next.js Metadata from a page configuration
 */
export function generateMetadataFromConfig(config: PageConfig): Metadata {
    const baseUrl = 'https://campusmate.app';

    return {
        ...baseMetadata,
        title: config.title,
        description: config.description,
        alternates: {
            canonical: config.path === '/' ? baseUrl : `${baseUrl}${config.path}`
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: config.title,
            description: config.description,
            url: config.path === '/' ? baseUrl : `${baseUrl}${config.path}`,
            images: config.ogImage
                ? [{ url: config.ogImage, width: 1200, height: 630, alt: config.title }]
                : baseMetadata.openGraph?.images,
        },
        twitter: {
            ...baseMetadata.twitter,
            title: config.title,
            description: config.description,
        },
    };
}

// Pre-register core pages for reference
registerPage({
    key: 'home',
    title: 'SEU CampusMate - Ultimate tool for SEU Students',
    description: 'A student companion app for Southeast University offering class routine widgets, CGPA and attendance calculators, faculty reviews, forums, and academic tools.',
    path: '/',
    changeFrequency: 'weekly',
    priority: 1.0,
});

registerPage({
    key: 'tools',
    title: 'Academic Tools | SEU CampusMate',
    description: 'Access a comprehensive suite of academic tools including CGPA calculator, attendance tracker, exam routine, and more.',
    path: '/tools',
    changeFrequency: 'weekly',
    priority: 0.9,
});

registerPage({
    key: 'cgpa-calculator',
    title: 'CGPA Calculator | SEU CampusMate',
    description: 'Calculate your CGPA easily with our advanced CGPA calculator designed for SEU students.',
    path: '/tools/cgpa-calculator',
    structuredDataType: 'tool',
    changeFrequency: 'monthly',
    priority: 0.8,
});

registerPage({
    key: 'exam-routine',
    title: 'SEU Exam Routine Finder | CampusMate',
    description: 'Find your exam schedules easily by entering course codes. Get exam dates, times, and faculty information for your courses.',
    path: '/tools/exam-routine',
    structuredDataType: 'tool',
    revalidate: 3600, // Revalidate every hour
    changeFrequency: 'daily',
    priority: 0.9,
});

registerPage({
    key: 'tuition-calculator',
    title: 'Tuition Calculator | SEU CampusMate',
    description: 'Calculate your tuition fees and other academic expenses with our tuition calculator.',
    path: '/tools/tuition-calculator',
    structuredDataType: 'tool',
    changeFrequency: 'monthly',
    priority: 0.8,
});

registerPage({
    key: 'attendance-calculator',
    title: 'Attendance Calculator | SEU CampusMate',
    description: 'Track your class attendance and calculate attendance percentages with our attendance calculator.',
    path: '/tools/attendance-calculator',
    structuredDataType: 'tool',
    changeFrequency: 'monthly',
    priority: 0.8,
});
