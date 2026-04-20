import { File, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { TransferProofSummary } from '@/types/transfers';

interface TransferProofThumbnailProps {
  summary: TransferProofSummary;
  onClick: () => void;
}

function isImageMimeType(mimeType: string | null): boolean {
  return Boolean(mimeType && mimeType.startsWith('image/'));
}

export function TransferProofThumbnail({ summary, onClick }: TransferProofThumbnailProps) {
  if (!summary.proofUrl) {
    return <span className="text-muted-foreground">Sin comprobante</span>;
  }

  if (isImageMimeType(summary.proofMimeType)) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Ver comprobante de imagen"
      >
        <img
          src={summary.proofUrl}
          alt={summary.proofFilename ?? `Comprobante #${summary.id}`}
          className="h-10 w-10 rounded object-cover"
        />
      </button>
    );
  }

  const isPdf = summary.proofMimeType === 'application/pdf';

  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} className="gap-2">
      {isPdf ? <FileText className="size-4" /> : <File className="size-4" />}
      <span>{isPdf ? 'PDF' : 'Archivo'}</span>
    </Button>
  );
}
