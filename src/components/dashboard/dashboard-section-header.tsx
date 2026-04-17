import type { ReactNode } from 'react';

interface DashboardSectionHeaderProps {
  title: string;
  description: string;
  aside?: ReactNode;
  id?: string;
}

export function DashboardSectionHeader({ title, description, aside, id }: DashboardSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h2 id={id} className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
