import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata("bloodDonors");

export default function BloodDonorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
