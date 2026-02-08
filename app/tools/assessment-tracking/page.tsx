import { Container } from '@/components/ui/container';
import { MarksTracker } from '@/components/marks-tracker';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata('assessmentTracking');

export default function AssessmentTrackingPage() {
    return (
        <div className="pt-12 md:pt-16">
            <Container className="py-8 md:py-16">
                <div className="max-w-5xl mx-auto">
                    <MarksTracker />
                </div>
            </Container>
        </div>
    );
}