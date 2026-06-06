import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

// Roles stored on `admin_users.role`. Superadmin is determined separately by
// SUPERADMIN_EMAIL (see lib/superadmin.ts) and always outranks these.
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const DEFAULT_ROLE: Role = ROLES.ADMIN;

export function isValidRole(value: unknown): value is Role {
  return value === ROLES.ADMIN || value === ROLES.MODERATOR;
}

// Minimal user shape readable in both the edge `authorized` callback and on the server.
type RoleUser = { role?: string | null; isSuperAdmin?: boolean } | null | undefined;

/** True only for non-superadmin users explicitly carrying the moderator role. */
export function isModerator(user: RoleUser): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return false;
  return user.role === ROLES.MODERATOR;
}

/** Admins, moderators, and the superadmin may all manage the Hackathon section. */
export function canManageHackathons(session: Session | null): boolean {
  return Boolean(session?.user);
}

/**
 * Guard for Hackathon admin APIs: any authenticated admin user (admin, moderator,
 * or superadmin) is allowed. Returns a 401 response when unauthenticated, else null.
 */
export function requireHackathonManager(session: Session | null): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Guard for admin APIs outside the Hackathon section: rejects moderators with 403
 * and unauthenticated requests with 401. Returns the error response, or null when allowed.
 */
export function requireAdmin(session: Session | null): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (isModerator(session.user)) {
    return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
  }
  return null;
}
