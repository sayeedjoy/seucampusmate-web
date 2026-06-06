import { auth } from '@/auth';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { isSuperAdminEmail } from '@/lib/superadmin';
import { isValidRole } from '@/lib/roles';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden: superadmin only' }, { status: 403 });
  }

  const resolved = await params;
  const id = Number(resolved.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid admin id.' }, { status: 400 });
  }

  let body: { role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isValidRole(body.role)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  }

  const existing = await db
    .select({ id: adminUsers.id, email: adminUsers.email })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
  }

  // The superadmin's effective role is env-driven; don't let it be downgraded here.
  if (isSuperAdminEmail(existing[0].email)) {
    return NextResponse.json({ error: 'Superadmin role cannot be changed.' }, { status: 403 });
  }

  const updated = await db
    .update(adminUsers)
    .set({ role: body.role, updatedAt: new Date() })
    .where(eq(adminUsers.id, id))
    .returning({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
    });

  return NextResponse.json({
    success: true,
    user: { ...updated[0], isSuperAdmin: isSuperAdminEmail(updated[0].email) },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden: superadmin only' }, { status: 403 });
  }

  const resolved = await params;
  const id = Number(resolved.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid admin id.' }, { status: 400 });
  }

  const existing = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
  }

  const target = existing[0];

  if (target.id === Number(session.user.id)) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }

  if (isSuperAdminEmail(target.email)) {
    return NextResponse.json({ error: 'Superadmin account cannot be deleted.' }, { status: 403 });
  }

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  return NextResponse.json({ success: true });
}
