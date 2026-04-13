import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type ReportsVisualStateVariant = 'loading' | 'empty' | 'error';

interface ReportsVisualStateProps {
  title: string;
  description: string;
  variant: ReportsVisualStateVariant;
  action?: ReactNode;
}

const variantConfig: Record<ReportsVisualStateVariant, { icon: typeof LoaderCircle; className: string }> = {
  loading: {
    icon: LoaderCircle,
    className: 'border-border bg-card text-muted-foreground',
  },
  empty: {
    icon: Inbox,
    className: 'border-border bg-card text-muted-foreground',
  },
  error: {
    icon: AlertCircle,
    className: 'border-destructive/30 bg-destructive/5 text-destructive',
  },
};

export function ReportsVisualState({ title, description, variant, action }: ReportsVisualStateProps) {
  const { icon: Icon, className } = variantConfig[variant];

  return (
    <div className={`rounded-xl border p-6 ${className}`} role="status">
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 size-5 ${variant === 'loading' ? 'animate-spin' : ''}`} />
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          {action ? <div className="pt-2">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
