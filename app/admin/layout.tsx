import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? '';
  const isPublicAdminPage = pathname === '/admin/login' || pathname === '/admin/setup';

  if (isPublicAdminPage) {
    return children;
  }

  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <AdminShell
      userName={session.user.name ?? 'Admin'}
      userEmail={session.user.email ?? ''}
      isSuperAdmin={session.user.isSuperAdmin}
    >
      {children}
    </AdminShell>
  );
}
