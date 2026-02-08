import TuitionCalculator from '@/app/tools/tuition-calculator/tuition-calculator';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata('tuitionCalculator');

export default function TuitionCalculatorPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    Tuition Fees Calculator
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Estimate your semester fees, payment schedule, and installments at Southeast University.
                </p>
            </div>
            <TuitionCalculator />
        </div>
    );
}