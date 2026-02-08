import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Attendance Calculator - CampusMate',
    description: 'Track your class attendance and ensure you meet the 75% requirement at Southeast University.',
};

export default function AttendanceCalculatorPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Track Your Attendance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Monitor your attendance percentage and calculate how many classes you can miss while maintaining the required 75% attendance.
                    </p>

                    {/* Attendance Calculator component will go here */}
                    <div className="bg-muted rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">Attendance Calculator component coming soon...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
