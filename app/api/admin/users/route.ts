import { auth } from '@/auth';
import { hashPassword } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { isSuperAdminEmail, normalizeEmail } from '@/lib/superadmin';
import { asc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden: superadmin only' }, { status: 403 });
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

  return NextResponse.json({
    users: users.map(user => ({
      ...user,
      isSuperAdmin: isSuperAdminEmail(user.email),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden: superadmin only' }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, password } = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  const trimmedName = (name ?? '').trim();
  const normalizedEmail = normalizeEmail(email);
  const safePassword = password ?? '';

  if (!trimmedName || !normalizedEmail || !safePassword) {
    return NextResponse.json(
      { error: 'Name, email, and password are required.' },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  if (safePassword.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: 'An admin with this email already exists.' }, { status: 409 });
  }

  const passwordHash = await hashPassword(safePassword);

  const inserted = await db
    .insert(adminUsers)
    .values({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    })
    .returning({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      createdAt: adminUsers.createdAt,
    });

  return NextResponse.json({
    success: true,
    user: {
      ...inserted[0],
      isSuperAdmin: isSuperAdminEmail(inserted[0].email),
    },
  });
}
