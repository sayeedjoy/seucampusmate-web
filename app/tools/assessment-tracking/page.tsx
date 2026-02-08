import { Container } from '@/components/ui/container';
import { Header } from '@/components/navbar/header';
import { Footer } from '@/components/footer';
import { MarksTracker } from '@/components/marks-tracker';

export default function AssessmentTrackingPage() {
    return (
        <>
            <Header />
            <main className="pt-12 md:pt-16">
                <Container className="py-8 md:py-16">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-8 md:mb-10">

                        </div>

                        <MarksTracker />
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}