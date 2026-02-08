import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata("questionBank");

export default function QuestionBankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
