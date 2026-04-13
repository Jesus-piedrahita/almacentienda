interface LegendItem {
  colorClassName: string;
  label: string;
}

interface ReportsLegendProps {
  items: LegendItem[];
}

export function ReportsLegend({ items }: ReportsLegendProps) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {items.map((item) => (
        <div key={`${item.label}-${item.colorClassName}`} className="flex items-center gap-2">
          <span className={`inline-block size-2.5 rounded-full ${item.colorClassName}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
