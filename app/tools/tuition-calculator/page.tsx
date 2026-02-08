import { ToolPageLayout } from '@/components/layouts';
import TuitionCalculator from '@/components/tuition-calculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tuition Fees Calculator - CampusMate',
    description: 'Calculate your semester fees, payment schedules, and track financial obligations at Southeast University.',
};

export default function TuitionCalculatorPage() {
    return (
        <ToolPageLayout
            title="Tuition Fees Calculator"
            description="Calculate your semester fees, payment schedules, and track financial obligations."
            maxWidth="6xl"
        >
            <TuitionCalculator />
        </ToolPageLayout>
    );
}