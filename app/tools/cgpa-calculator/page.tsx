import CgpaCalculator from './CgpaCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CGPA Calculator - CampusMate',
    description: 'Calculate your Cumulative Grade Point Average (CGPA) with our easy-to-use calculator. Track your academic performance and plan your studies effectively.',
};

export default function CGPACalculatorPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    CGPA Calculator
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Calculate your Cumulative Grade Point Average and track your academic performance.
                </p>
            </div>
            <CgpaCalculator />
        </div>
    );
}
