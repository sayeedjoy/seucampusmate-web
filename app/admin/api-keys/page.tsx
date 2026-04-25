import { db } from '@/lib/db';
import { apiKeys, adminUsers } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { isSuperAdminEmail } from '@/lib/superadmin';
import ApiKeysClient from './ApiKeysClient';

export default async function ApiKeysPage() {
  const session = await auth();
  const isSuperAdmin = isSuperAdminEmail(session?.user?.email ?? '');

  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      isActive: apiKeys.isActive,
      createdByName: adminUsers.name,
    })
    .from(apiKeys)
    .leftJoin(adminUsers, eq(apiKeys.createdById, adminUsers.id))
    .orderBy(desc(apiKeys.createdAt));

  return <ApiKeysClient keys={rows} isSuperAdmin={isSuperAdmin} />;
}
