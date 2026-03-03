import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatsCardProps } from '@/lib/types';

export function StatsCard({ title, value, description, icon: Icon, trend, iconColor }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', iconColor || 'bg-primary/10 text-primary')}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <div className="flex items-center gap-2">
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          {trend && (
            <span
              className={cn(
                'mt-1 flex items-center text-xs font-medium',
                trend.positive ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {trend.positive ? (
                <TrendingUp className="mr-0.5 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-0.5 h-3 w-3" />
              )}
              {trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
