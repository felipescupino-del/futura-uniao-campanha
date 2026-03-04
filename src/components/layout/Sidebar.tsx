'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Megaphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/brokers', label: 'Corretores', icon: Users },
  { href: '/campaigns', label: 'Campanhas', icon: Megaphone },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn('flex w-64 flex-col border-r bg-card', className)}>
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <Image src="/logo.jpeg" alt="Grupo Futura União" width={40} height={40} className="shrink-0 rounded" />
        <div>
          <h1 className="text-sm font-bold leading-tight">Campanhas</h1>
          <p className="text-[11px] text-muted-foreground">Grupo Futura União</p>
        </div>
      </div>
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
