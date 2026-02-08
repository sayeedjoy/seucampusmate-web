import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata('campusInfo');

export default function CampusInfoPage() {
    return (
        <Container className="py-16">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                        Campus Information
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Get detailed information about campus facilities, locations, and services.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Campus Facilities & Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground">
                            Explore campus facilities, find locations, and learn about available services.
                        </p>

                        {/* Campus Info component will go here */}
                        <div className="bg-muted rounded-lg p-6 text-center">
                            <p className="text-muted-foreground">Campus Information component coming soon...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
