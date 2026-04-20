import { useEffect, useMemo, useRef, useState } from 'react';

import { TransferProofPreviewModal } from '@/components/transfers/transfer-proof-preview-modal';
import { TransferProofThumbnail } from '@/components/transfers/transfer-proof-thumbnail';
import { TransferStatusBadge } from '@/components/transfers/transfer-status-badge';
import {
  TransferContextBlock,
  formatTransferDate,
} from '@/components/transfers/transfer-shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInfiniteTransfers } from '@/hooks/use-transfers';
import { cn } from '@/lib/utils';
import {
  PROCESSED_TRANSFER_STATUS,
  type ProcessedTransferStatus,
  type TransferProofSummary,
} from '@/types/transfers';

const HISTORY_FILTERS: Array<{ label: string; value: ProcessedTransferStatus }> = [
  { label: 'Confirmadas', value: PROCESSED_TRANSFER_STATUS.CONFIRMED },
  { label: 'Rechazadas', value: PROCESSED_TRANSFER_STATUS.REJECTED },
];

export function TransferHistoryPanel() {
  const [activeStatus, setActiveStatus] = useState<ProcessedTransferStatus>(
    PROCESSED_TRANSFER_STATUS.CONFIRMED
  );
  const [selectedProof, setSelectedProof] = useState<TransferProofSummary | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteTransfers(activeStatus);

  const historyItems = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const root = scrollContainerRef.current;
    const target = sentinelRef.current;

    if (!root || !target) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (!firstEntry?.isIntersecting || !hasNextPage || isFetchingNextPage) {
          return;
        }

        void fetchNextPage();
      },
      {
        root,
        rootMargin: '0px 0px 160px 0px',
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, historyItems.length]);

  const currentTotal = data?.pages[0]?.pagination.total ?? 0;

  const handleOpenPreview = (summary: TransferProofSummary) => {
    if (!summary.proofUrl) {
      return;
    }

    setSelectedProof(summary);
    setIsPreviewOpen(true);
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle>Historial de transferencias</CardTitle>
          <CardDescription>
            Revisá transferencias procesadas sin salir del flujo actual.
          </CardDescription>
        </div>

        <div className="flex flex-wrap gap-2">
          {HISTORY_FILTERS.map((filter) => {
            const isActive = filter.value === activeStatus;

            return (
              <Button
                key={filter.value}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                aria-pressed={isActive}
                onClick={() => {
                  setActiveStatus(filter.value);
                }}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && historyItems.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-8 text-sm text-muted-foreground">
            Cargando historial de transferencias...
          </div>
        ) : null}

        {isError && historyItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 px-4 py-6 text-sm">
            <p className="font-medium text-destructive">No pudimos cargar el historial.</p>
            <p className="mt-1 text-muted-foreground">
              Probá reintentando sin salir de la pantalla de transferencias.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => {
                void refetch();
              }}
            >
              Reintentar
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && historyItems.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-8 text-sm text-muted-foreground">
            No hay transferencias {activeStatus === 'confirmed' ? 'confirmadas' : 'rechazadas'} todavía.
          </div>
        ) : null}

        {historyItems.length > 0 ? (
          <>
            <p className="text-xs text-muted-foreground">
              {currentTotal} transferencia{currentTotal === 1 ? '' : 's'} en este filtro.
            </p>

            <div
              ref={scrollContainerRef}
              className="max-h-[70vh] space-y-3 overflow-y-auto pr-2"
              data-testid="transfer-history-scroll-container"
            >
              {historyItems.map((transfer) => {
                const processedAt = transfer.validatedAt ?? transfer.createdAt;

                return (
                  <article
                    key={`${transfer.id}-${transfer.status}`}
                    className="rounded-lg border bg-muted/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">Transferencia #{transfer.id}</p>
                        <p className="text-xs text-muted-foreground">
                          Procesada el {formatTransferDate(processedAt)}
                        </p>
                      </div>
                      <TransferStatusBadge status={transfer.status} />
                    </div>

                    <div className="mt-3 space-y-2 text-sm">
                      <p>Referencia: {transfer.referenceNote || 'Sin referencia'}</p>
                      <TransferContextBlock transfer={transfer} />
                      <TransferProofThumbnail
                        summary={transfer}
                        onClick={() => {
                          handleOpenPreview(transfer);
                        }}
                      />
                    </div>
                  </article>
                );
              })}

              <div
                ref={sentinelRef}
                className={cn('h-4 w-full', !hasNextPage && 'hidden')}
                data-testid="transfer-history-sentinel"
              />

              {isFetchingNextPage ? (
                <p className="py-2 text-center text-xs text-muted-foreground">Cargando más transferencias...</p>
              ) : null}

              {!hasNextPage ? (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  No hay más transferencias para mostrar.
                </p>
              ) : null}

              {isError && historyItems.length > 0 ? (
                <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 px-3 py-2 text-xs">
                  <p className="text-destructive">No pudimos cargar más resultados.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    className="mt-1 h-auto px-0"
                    onClick={() => {
                      void refetch();
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </CardContent>

      <TransferProofPreviewModal
        open={isPreviewOpen}
        onOpenChange={(open) => {
          setIsPreviewOpen(open);
          if (!open) {
            setSelectedProof(null);
          }
        }}
        proof={selectedProof}
      />
    </Card>
  );
}
