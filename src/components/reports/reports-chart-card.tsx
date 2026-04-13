import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportsChartCardProps {
  title: string;
  description?: string;
  headerAside?: ReactNode;
  children: ReactNode;
}

export function ReportsChartCard({ title, description, headerAside, children }: ReportsChartCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>

          {headerAside ? <div className="shrink-0">{headerAside}</div> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
