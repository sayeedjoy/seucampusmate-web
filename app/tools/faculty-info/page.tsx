import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FacultyInfoPage() {
    return (
        <Container className="py-16">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                        Faculty Information
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Find faculty contact information, office hours, and department details.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Faculty Directory</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground">
                            Search for faculty members, view their profiles, and find contact information.
                        </p>

                        {/* Faculty Info component will go here */}
                        <div className="bg-muted rounded-lg p-6 text-center">
                            <p className="text-muted-foreground">Faculty Information component coming soon...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
