import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { isSuperAdminEmail } from '@/lib/superadmin';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSuperAdminEmail(session.user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden: superadmin only.' }, { status: 403 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json({ error: 'Invalid key id.' }, { status: 400 });
  }

  const deleted = await db
    .delete(apiKeys)
    .where(eq(apiKeys.id, numId))
    .returning({ id: apiKeys.id });

  if (!deleted.length) {
    return NextResponse.json({ error: 'Key not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json({ error: 'Invalid key id.' }, { status: 400 });
  }

  let body: { isActive?: boolean };
  try {
    body = await (request as Request & { json(): Promise<{ isActive?: boolean }> }).json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const updated = await db
    .update(apiKeys)
    .set({ isActive: Boolean(body.isActive) })
    .where(eq(apiKeys.id, numId))
    .returning({ id: apiKeys.id, isActive: apiKeys.isActive });

  if (!updated.length) {
    return NextResponse.json({ error: 'Key not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, isActive: updated[0].isActive });
}
