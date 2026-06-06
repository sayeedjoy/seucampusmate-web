import type { NextAuthConfig } from 'next-auth';
import { ADMIN_SESSION_MAX_AGE_SECONDS } from '@/lib/admin-session';
import { isModerator } from '@/lib/roles';

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    updateAge: 5 * 60,
  },
  jwt: {
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isLoginPage = nextUrl.pathname === '/admin/login';
      const isSetupPage = nextUrl.pathname === '/admin/setup';
      const isSetupApi = nextUrl.pathname === '/api/admin/setup';

      // Setup page and its API are always public
      if (isSetupPage || isSetupApi) return true;

      if (isAdminRoute && !isLoginPage) {
        if (!isLoggedIn) return false;

        // Moderators are scoped to the Hackathon section only; bounce them back
        // to /admin/hackathon from any other admin page.
        if (isModerator(auth!.user as { role?: string; isSuperAdmin?: boolean })) {
          const isHackathonArea = nextUrl.pathname.startsWith('/admin/hackathon');
          if (!isHackathonArea) {
            return Response.redirect(new URL('/admin/hackathon', nextUrl));
          }
        }
        return true;
      }
      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL('/admin/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
