import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DashboardKpiCardProps {
  title: string;
  value: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: 'default' | 'warning' | 'danger';
  isLoading?: boolean;
}

const toneClasses: Record<NonNullable<DashboardKpiCardProps['tone']>, string> = {
  default: 'border-border bg-card',
  warning:
    'border-amber-300 bg-amber-50/70 dark:border-amber-500/60 dark:bg-amber-500/10',
  danger:
    'border-red-300 bg-red-50/70 dark:border-red-500/60 dark:bg-red-500/10',
};

const toneAccentClasses: Record<NonNullable<DashboardKpiCardProps['tone']>, string> = {
  default: 'text-muted-foreground',
  warning: 'text-amber-700 dark:text-amber-300',
  danger: 'text-red-700 dark:text-red-300',
};

const toneSupportClasses: Record<NonNullable<DashboardKpiCardProps['tone']>, string> = {
  default: 'text-muted-foreground',
  warning: 'text-amber-800/90 dark:text-amber-200/85',
  danger: 'text-red-800/90 dark:text-red-200/85',
};

export function DashboardKpiCard({
  title,
  value,
  description,
  icon,
  action,
  tone = 'default',
  isLoading = false,
}: DashboardKpiCardProps) {
  return (
    <Card className={cn(toneClasses[tone])}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className={cn('text-sm font-medium', toneAccentClasses[tone])}>{title}</CardTitle>
        </div>
        {icon ? <div className={cn(toneAccentClasses[tone])}>{icon}</div> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <div className={cn('text-2xl font-bold tracking-tight text-foreground', tone !== 'default' && toneAccentClasses[tone])}>{value}</div>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className={cn('text-xs', toneSupportClasses[tone])}>{description}</p>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
