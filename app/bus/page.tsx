import { Container } from "@/components/ui/container";
import BusRouteMap from "./bus";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bus Routes",
    description:
        "View SEU bus routes and stops. Interactive map showing all university bus routes with detailed stop information.",
    keywords: [
        "SEU bus",
        "university bus",
        "bus routes",
        "Southeast University",
        "campus transport",
        "bus schedule",
    ],
    openGraph: {
        title: "Bus Routes - SEU CampusMate",
        description:
            "View SEU bus routes and stops. Interactive map showing all university bus routes with detailed stop information.",
        type: "website",
        url: "https://campusmate.app/bus",
    },
    twitter: {
        card: "summary_large_image",
        title: "Bus Routes - SEU CampusMate",
        description:
            "View SEU bus routes and stops. Interactive map showing all university bus routes with detailed stop information.",
    },
};

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
