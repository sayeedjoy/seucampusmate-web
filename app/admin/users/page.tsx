import { redirect } from 'next/navigation';
import { asc } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { isSuperAdminEmail } from '@/lib/superadmin';
import UsersClient from './UsersClient';

type AdminSummary = {
  id: number;
  name: string | null;
  email: string;
  createdAt: Date;
  isSuperAdmin: boolean;
};

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect('/admin/dashboard');
  }

  const users = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.createdAt));

  const admins: AdminSummary[] = users.map(user => ({
    ...user,
    isSuperAdmin: isSuperAdminEmail(user.email),
  }));

  return <UsersClient admins={admins} currentAdminId={session.user.id ? Number(session.user.id) : null} />;
}
