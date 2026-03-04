'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Megaphone, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/brokers',   label: 'Corretores', icon: Users },
  { href: '/campaigns', label: 'Campanhas',  icon: Megaphone },
];

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ className, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          className,
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center border-b py-4 transition-all duration-300',
          collapsed ? 'justify-center px-2' : 'gap-3 px-5',
        )}>
          <Image
            src="/logo.png"
            alt="Grupo Futura União"
            width={collapsed ? 32 : 56}
            height={collapsed ? 32 : 56}
            className="shrink-0 transition-all duration-300"
          />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold leading-tight">Campanhas</h1>
              <p className="text-[11px] text-muted-foreground">Grupo Futura União</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              const linkContent = (
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center rounded-lg text-sm font-medium transition-colors',
                    collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && link.label}
                </Link>
              );

              if (collapsed) {
                return (
                  <li key={link.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {link.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return <li key={link.href}>{linkContent}</li>;
            })}
          </ul>
        </nav>

        {/* Toggle button */}
        {onToggle && (
          <div className={cn(
            'border-t p-3',
            collapsed ? 'flex justify-center' : '',
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggle}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {collapsed ? (
                    <PanelLeftOpen className="h-4 w-4 shrink-0" />
                  ) : (
                    <>
                      <PanelLeftClose className="h-4 w-4 shrink-0" />
                      <span>Recolher</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  Expandir
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
