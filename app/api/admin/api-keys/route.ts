import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apiKeys, adminUsers } from '@/lib/db/schema';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  return NextResponse.json({ keys: rows });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  const rawKey = 'ck_' + crypto.randomBytes(32).toString('hex');
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 11);

  const createdById = session.user.id ? Number(session.user.id) : null;

  const inserted = await db
    .insert(apiKeys)
    .values({ name, keyHash, keyPrefix, createdById, isActive: true })
    .returning();

  const row = inserted[0];

  return NextResponse.json(
    {
      id: row.id,
      name: row.name,
      rawKey,
      keyPrefix: row.keyPrefix,
      createdAt: row.createdAt,
    },
    { status: 201 }
  );
}
