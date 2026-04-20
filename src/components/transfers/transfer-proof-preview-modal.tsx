import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TransferProofSummary } from '@/types/transfers';

interface TransferProofPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proof: TransferProofSummary | null;
}

function isImageMimeType(mimeType: string | null): boolean {
  return Boolean(mimeType && mimeType.startsWith('image/'));
}

function PreviewErrorState({ proofUrl }: { proofUrl: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
      <AlertCircle className="size-8" />
      <p className="text-sm">Vista previa no disponible.</p>
      {proofUrl ? (
        <a
          href={proofUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary underline underline-offset-2"
        >
          Abrir comprobante
        </a>
      ) : null}
    </div>
  );
}

export function TransferProofPreviewModal({ open, onOpenChange, proof }: TransferProofPreviewModalProps) {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadError(false);
    }
  }, [open, proof?.id]);

  const proofUrl = proof?.proofUrl ?? null;
  const mimeType = proof?.proofMimeType ?? null;
  const title = proof ? `Comprobante #${proof.id}` : 'Comprobante';

  const renderPreview = () => {
    if (!proof || !proofUrl || loadError) {
      return <PreviewErrorState proofUrl={proofUrl} />;
    }

    if (isImageMimeType(mimeType)) {
      return (
        <img
          src={proofUrl}
          alt={proof.proofFilename ?? title}
          className="mx-auto max-h-[70vh] w-auto rounded object-contain"
          onError={() => setLoadError(true)}
        />
      );
    }

    if (mimeType === 'application/pdf') {
      return (
        <iframe
          src={proofUrl}
          title={title}
          className="h-[70vh] w-full rounded border"
          onError={() => setLoadError(true)}
        />
      );
    }

    return <PreviewErrorState proofUrl={proofUrl} />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {proof?.proofFilename ? `Archivo: ${proof.proofFilename}` : 'Vista previa del comprobante'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-auto">
          {renderPreview()}
          {proofUrl ? (
            <div className="text-center">
              <a
                href={proofUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline underline-offset-2"
              >
                Abrir comprobante en una pestaña nueva
              </a>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
