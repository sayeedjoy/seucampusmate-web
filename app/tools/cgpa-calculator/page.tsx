import CgpaCalculator from './CgpaCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CGPA Calculator - CampusMate',
    description: 'Calculate your Cumulative Grade Point Average (CGPA) with our easy-to-use calculator. Track your academic performance and plan your studies effectively.',
};

export default function CGPACalculatorPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <CgpaCalculator />
        </div>
    );
}
