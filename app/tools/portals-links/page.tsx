import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata('portalsLinks');

export default function PortalsLinksPage() {
    return (
        <Container className="py-16">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                        Site and Portals Links
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Quick access to university portals, student systems, and important websites.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Important Links & Portals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground">
                            Access all important university websites, student portals, and online services.
                        </p>

                        {/* Portals Links component will go here */}
                        <div className="bg-muted rounded-lg p-6 text-center">
                            <p className="text-muted-foreground">Portals & Links component coming soon...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
