import { Header } from '@/components/navbar/header';
import { Footer } from '@/components/footer';
import { Container } from '@/components/ui/container';
import { LeaderboardTable } from '@/components/cp/leaderboard-table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CP Leaderboard',
  description: 'View the top Codeforces users from Southeast University. Real-time competitive programming leaderboard for SEU students.',
  keywords: ['CP leaderboard', 'Codeforces', 'competitive programming', 'SEU', 'Southeast University', 'programming contest'],
  openGraph: {
    title: 'CP Leaderboard - SEU CampusMate',
    description: 'View the top Codeforces users from Southeast University. Real-time competitive programming leaderboard for SEU students.',
    type: 'website',
    url: 'https://campusmate.app/cp',
    images: [
      {
        url: '/cf.webp',
        width: 1200,
        height: 630,
        alt: 'CP Leaderboard - SEU CampusMate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CP Leaderboard - SEU CampusMate',
    description: 'View the top Codeforces users from Southeast University. Real-time competitive programming leaderboard for SEU students.',
    images: ['/cf.webp'],
  },
};

export const dynamic = 'force-dynamic';

export default function CPPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white font-inter">
        <Container className="pt-16 md:pt-20 lg:pt-24 pb-16">
          <LeaderboardTable />
        </Container>
      </main>
      <Footer />
    </>
  );
}
