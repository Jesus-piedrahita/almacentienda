import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardAlertSummaryCardProps {
  title: string;
  value: string;
  description: string;
  severity?: 'neutral' | 'warning' | 'danger';
  icon?: ReactNode;
  footer?: ReactNode;
}

const severityClasses: Record<NonNullable<DashboardAlertSummaryCardProps['severity']>, string> = {
  neutral: 'border-border bg-card',
  warning:
    'border-amber-300 bg-amber-50/70 dark:border-amber-500/60 dark:bg-amber-500/10',
  danger:
    'border-red-300 bg-red-50/70 dark:border-red-500/60 dark:bg-red-500/10',
};

const severityAccentClasses: Record<NonNullable<DashboardAlertSummaryCardProps['severity']>, string> = {
  neutral: 'text-muted-foreground',
  warning: 'text-amber-700 dark:text-amber-300',
  danger: 'text-red-700 dark:text-red-300',
};

const severitySupportClasses: Record<NonNullable<DashboardAlertSummaryCardProps['severity']>, string> = {
  neutral: 'text-muted-foreground',
  warning: 'text-amber-800/90 dark:text-amber-200/85',
  danger: 'text-red-800/90 dark:text-red-200/85',
};

export function DashboardAlertSummaryCard({
  title,
  value,
  description,
  severity = 'neutral',
  icon,
  footer,
}: DashboardAlertSummaryCardProps) {
  return (
    <Card className={cn(severityClasses[severity])}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className={cn('text-sm font-medium', severityAccentClasses[severity])}>{title}</CardTitle>
        </div>
        {icon ? <div className={cn(severityAccentClasses[severity])}>{icon}</div> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div className={cn('text-2xl font-bold tracking-tight text-foreground', severity !== 'neutral' && severityAccentClasses[severity])}>{value}</div>
          {footer ? <div className={cn('shrink-0', severitySupportClasses[severity])}>{footer}</div> : null}
        </div>
        <p className={cn('text-xs', severitySupportClasses[severity])}>{description}</p>
      </CardContent>
    </Card>
  );
}
