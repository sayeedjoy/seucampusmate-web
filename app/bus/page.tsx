import { Container } from "@/components/ui/container";
import BusRouteMap from "./bus";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata("bus");

export default function BusPage() {
    return (
        <div className="min-h-screen bg-background font-inter">
            <Container className="pt-16 md:pt-20 lg:pt-24 pb-16">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Bus Routes
                    </h1>
                    <p className="text-muted-foreground">
                        Interactive map of SEU bus routes. Click on markers for stop
                        details.
                    </p>
                </div>
                <BusRouteMap />
            </Container>
        </div>
    );
}
