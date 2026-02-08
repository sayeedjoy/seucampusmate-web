import { Container } from '@/components/ui/container';
import { LeaderboardTable } from '@/components/cp/leaderboard-table';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata('cp', {
  openGraph: {
    images: [
      {
        url: '/cf.webp',
        width: 1200,
        height: 630,
        alt: 'CP Leaderboard - SEU CampusMate',
      },
    ],
  },
});

export const dynamic = 'force-dynamic';

export default function CPPage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Container className="pt-16 md:pt-20 lg:pt-24 pb-16">
        <LeaderboardTable />
      </Container>
    </div>
  );
}
