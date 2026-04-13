import type { ReactNode } from 'react';

interface ReportsSectionHeaderProps {
  title: string;
  description: string;
  aside?: ReactNode;
}

export function ReportsSectionHeader({ title, description, aside }: ReportsSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
