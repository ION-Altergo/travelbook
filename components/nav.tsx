"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, Plane, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserNav } from './user-nav';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Calendar },
  { name: 'Trips', href: '/trips', icon: Plane },
  { name: 'Team', href: '/engineers', icon: Users },
  { name: 'Expenses', href: '/expenses', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

interface NavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  onSignOut?: () => void;
}

export function Nav({ user, onSignOut }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <div className="mr-8 flex items-center space-x-2">
            <Plane className="h-6 w-6" />
            <span className="text-lg font-semibold">Travelbook</span>
          </div>
          <div className="flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
        {user && onSignOut && (
          <UserNav user={user} onSignOut={onSignOut} />
        )}
      </div>
    </nav>
  );
}

