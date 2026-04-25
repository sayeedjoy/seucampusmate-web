import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth-utils';
import { isSuperAdminEmail } from '@/lib/superadmin';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        const users = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, email.toLowerCase()))
          .limit(1);

        if (users.length === 0) return null;

        const user = users[0];
        const passwordsMatch = await verifyPassword(password, user.passwordHash);
        if (!passwordsMatch) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  session: authConfig.session,
  jwt: authConfig.jwt,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      token.isSuperAdmin = isSuperAdminEmail((user?.email ?? token.email) as string | undefined);
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
      }
      return session;
    },
  },
});
