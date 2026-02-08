import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata("academicCalendar");

export default function AcademicCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
