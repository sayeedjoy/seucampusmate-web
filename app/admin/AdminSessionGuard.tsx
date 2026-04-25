'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import {
  ADMIN_LOGOUT_EVENT_KEY,
  ADMIN_SESSION_CHECK_INTERVAL_MS,
  ADMIN_SESSION_EXPIRY_BUFFER_MS,
  ADMIN_SESSION_IDLE_TIMEOUT_MS,
} from '@/lib/admin-session';

const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart', 'visibilitychange'];

export default function AdminSessionGuard() {
  const lastActivityAt = useRef<number | null>(null);
  const isSigningOut = useRef(false);

  useEffect(() => {
    lastActivityAt.current = Date.now();

    const logout = async () => {
      if (isSigningOut.current) return;
      isSigningOut.current = true;
      try {
        localStorage.setItem(ADMIN_LOGOUT_EVENT_KEY, String(Date.now()));
      } catch {
        // Storage can be unavailable in restricted browser modes.
      }
      await signOut({ callbackUrl: '/admin/login' });
    };

    const markActivity = () => {
      if (document.visibilityState !== 'hidden') {
        lastActivityAt.current = Date.now();
      }
    };

    const checkSession = async () => {
      const lastActivity = lastActivityAt.current ?? Date.now();
      const idleFor = Date.now() - lastActivity;
      if (idleFor >= ADMIN_SESSION_IDLE_TIMEOUT_MS) {
        await logout();
        return;
      }

      try {
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'same-origin',
        });

        if (!response.ok) {
          await logout();
          return;
        }

        const session = (await response.json()) as { expires?: string; user?: unknown };
        if (!session.user || !session.expires) {
          await logout();
          return;
        }

        const expiresAt = new Date(session.expires).getTime();
        if (Number.isNaN(expiresAt) || expiresAt <= Date.now() + ADMIN_SESSION_EXPIRY_BUFFER_MS) {
          await logout();
        }
      } catch {
        await logout();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ADMIN_LOGOUT_EVENT_KEY) {
        void logout();
      }
    };

    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });
    window.addEventListener('storage', handleStorage);

    const intervalId = window.setInterval(() => {
      void checkSession();
    }, ADMIN_SESSION_CHECK_INTERVAL_MS);

    void checkSession();

    return () => {
      window.clearInterval(intervalId);
      activityEvents.forEach(eventName => {
        window.removeEventListener(eventName, markActivity);
      });
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return null;
}
