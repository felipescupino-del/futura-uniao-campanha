'use client';

import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Menu, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  brokers: 'Corretores',
  campaigns: 'Campanhas',
  new: 'Nova Campanha',
};

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: breadcrumbLabels[seg] || (seg.match(/^\d+$/) ? `#${seg}` : seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <nav className="flex items-center text-sm">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center">
              {i > 0 && <ChevronRight className="mx-1 h-3.5 w-3.5 text-muted-foreground" />}
              {crumb.isLast ? (
                <span className="font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>
      <UserButton
        showName
        appearance={{
          elements: {
            avatarBox: 'h-8 w-8',
          },
        }}
      />
    </header>
  );
}
