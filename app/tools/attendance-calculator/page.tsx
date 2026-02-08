import { ToolPageLayout } from '@/components/layouts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Attendance Calculator - CampusMate',
    description: 'Track your class attendance and ensure you meet the 75% requirement at Southeast University.',
};

export default function AttendanceCalculatorPage() {
    return (
        <ToolPageLayout
            title="Attendance Calculator"
            description="Track your class attendance and ensure you meet the 75% requirement."
        >
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Track Your Attendance
                </h2>
                <p className="text-gray-600 mb-8">
                    Monitor your attendance percentage and calculate how many classes you can miss while maintaining the required 75% attendance.
                </p>

                {/* Attendance Calculator component will go here */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500">Attendance Calculator component coming soon...</p>
                </div>
            </div>
        </ToolPageLayout>
    );
}