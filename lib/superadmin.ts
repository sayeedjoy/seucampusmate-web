export function normalizeEmail(email?: string | null): string {
  return (email ?? '').trim().toLowerCase();
}

export function getSuperAdminEmail(): string {
  return normalizeEmail(process.env.SUPERADMIN_EMAIL);
}

export function isSuperAdminEmail(email?: string | null): boolean {
  const superAdminEmail = getSuperAdminEmail();
  if (!superAdminEmail) return false;
  return normalizeEmail(email) === superAdminEmail;
}
