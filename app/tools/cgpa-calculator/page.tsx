import CgpaCalculator from './CgpaCalculator';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata('cgpaCalculator');

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
