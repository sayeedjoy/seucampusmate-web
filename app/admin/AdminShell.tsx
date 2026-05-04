'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  History,
  Key,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  Upload,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AdminSessionGuard from './AdminSessionGuard';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: 'Routine',
    items: [
      { href: '/admin/dashboard', label: 'Routine Overview', icon: LayoutDashboard },
      { href: '/admin/upload', label: 'Upload Routine', icon: Upload },
    ],
  },
  {
    title: 'Content',
    items: [{ href: '/admin/team', label: 'Team', icon: Users }],
  },
  {
    title: 'AI & Activity',
    items: [
      { href: '/admin/chat-settings', label: 'Chat Settings', icon: MessageSquare },
      { href: '/admin/chat-history', label: 'Chat History', icon: History },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/users', label: 'Users', icon: Shield, superAdminOnly: true },
      { href: '/admin/api-keys', label: 'API Docs', icon: Key },
    ],
  },
];

function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getPageTitle(pathname: string) {
  for (const section of navSections) {
    const found = section.items.find((item) => isPathActive(pathname, item.href));
    if (found) return found.label;
  }
  return 'Admin';
}

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
  const pageTitle = getPageTitle(pathname);

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.superAdminOnly || isSuperAdmin),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <SidebarProvider>
      <AdminSessionGuard />

      <Sidebar collapsible="offcanvas" variant="sidebar">
        <SidebarHeader>
          <div className="rounded-md border bg-sidebar-accent/40 p-3">
            <p className="text-xs text-sidebar-foreground/70 uppercase tracking-wider font-medium">SEU CampusMate</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-semibold">Admin Panel</p>
              {isSuperAdmin && <Badge variant="secondary">Superadmin</Badge>}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {visibleSections.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarMenu>
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = isPathActive(pathname, href);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={label}>
                        <Link href={href}>
                          <Icon className="size-4" />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
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
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-auto" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{pageTitle}</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            <Settings className="size-3.5" />
            Admin Workspace
          </div>
        </header>
        <div className="min-h-[calc(100svh-3.5rem)] bg-muted/15">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
