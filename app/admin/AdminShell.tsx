'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Upload, Key, MessageSquare, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminSessionGuard from './AdminSessionGuard';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/upload', label: 'Upload Routine', icon: Upload },
  { href: '/admin/api-keys', label: 'API Keys', icon: Key },
  { href: '/admin/chat-settings', label: 'Chat Settings', icon: MessageSquare },
];

export default function AdminShell({
  children,
  userName,
  userEmail,
  isSuperAdmin,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <AdminSessionGuard />
      <aside className="w-56 border-r bg-muted/30 flex flex-col">
        <div className="px-4 py-5 border-b">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">SEU CampusMate</p>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="text-sm font-semibold">Admin Panel</p>
            {isSuperAdmin && <Badge variant="secondary">Superadmin</Badge>}
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                pathname === href
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="rounded-md border bg-background p-2">
            <p className="text-xs font-medium truncate">{userName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            {isSuperAdmin && (
              <Badge variant="secondary" className="mt-1 h-5 text-[10px]">
                Superadmin
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
