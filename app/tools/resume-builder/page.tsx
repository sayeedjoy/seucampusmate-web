import { createPageMetadata } from "@/lib/metadata";
import ResumeBuilder from "@/components/resume-builder/ResumeBuilder";

export const metadata = createPageMetadata("resumeBuilder");

export default function ResumeBuilderPage() {
  return <ResumeBuilder />;
}
