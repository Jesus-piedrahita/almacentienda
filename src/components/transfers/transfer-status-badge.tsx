import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TransferStatus } from '@/types/transfers';

interface TransferStatusBadgeProps {
  status: TransferStatus;
}

const LABELS: Record<TransferStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  rejected: 'Rechazada',
};

export function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === 'pending' && 'border-amber-300 text-amber-700 bg-amber-50',
        status === 'confirmed' && 'border-emerald-300 text-emerald-700 bg-emerald-50',
        status === 'rejected' && 'border-rose-300 text-rose-700 bg-rose-50'
      )}
    >
      {LABELS[status]}
    </Badge>
  );
}
