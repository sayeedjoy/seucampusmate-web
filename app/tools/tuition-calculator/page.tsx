import TuitionCalculator from '@/app/tools/tuition-calculator/tuition-calculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tuition Fees Calculator - CampusMate',
    description: 'Calculate your semester fees, payment schedules, and track financial obligations at Southeast University.',
};

export default function TuitionCalculatorPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <TuitionCalculator />
        </div>
    );
}