import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api, { uploadTransferProof } from '@/lib/api';
import { invalidateOperationalQueries } from '@/lib/query-invalidation';
import type {
  ProcessedTransferStatus,
  TransferProofList,
  TransferSaleContext,
  TransferProofSummary,
  ValidateTransferInput,
} from '@/types/transfers';

interface ApiTransferSaleContextItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface ApiTransferSaleContext {
  sale_id: number;
  created_at: string;
  total: number;
  items: ApiTransferSaleContextItem[];
}

interface ApiTransferProofSummary {
  id: number;
  status: 'pending' | 'confirmed' | 'rejected';
  proof_url: string | null;
  proof_mime_type: string | null;
  proof_filename: string | null;
  reference_note: string | null;
  client_name: string | null;
  sale_context: ApiTransferSaleContext | null;
  created_at: string;
  uploaded_at: string | null;
  validated_at: string | null;
  validated_by_user_id: number | null;
  sale_id: number | null;
  debt_payment_id: number | null;
}

interface ApiTransferProofList {
  data: ApiTransferProofSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface ApiUploadTransferProofResponse {
  proof_id: number;
  proof_url: string;
  proof_filename: string;
  proof_size_bytes: number;
  uploaded_at: string;
}

function mapApiTransferProofSummary(apiTransfer: ApiTransferProofSummary): TransferProofSummary {
  const saleContext: TransferSaleContext | null = apiTransfer.sale_context
    ? {
        saleId: String(apiTransfer.sale_context.sale_id),
        createdAt: apiTransfer.sale_context.created_at,
        total: apiTransfer.sale_context.total,
        items: apiTransfer.sale_context.items.map((item) => ({
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.subtotal,
        })),
      }
    : null;

  return {
    id: String(apiTransfer.id),
    status: apiTransfer.status,
    proofUrl: apiTransfer.proof_url,
    proofMimeType: apiTransfer.proof_mime_type,
    proofFilename: apiTransfer.proof_filename,
    referenceNote: apiTransfer.reference_note,
    clientName: apiTransfer.client_name,
    saleContext,
    createdAt: apiTransfer.created_at,
    uploadedAt: apiTransfer.uploaded_at,
    validatedAt: apiTransfer.validated_at,
    validatedByUserId:
      apiTransfer.validated_by_user_id !== null ? String(apiTransfer.validated_by_user_id) : null,
    saleId: apiTransfer.sale_id !== null ? String(apiTransfer.sale_id) : null,
    debtPaymentId: apiTransfer.debt_payment_id !== null ? String(apiTransfer.debt_payment_id) : null,
  };
}

export { mapApiTransferProofSummary };

function mapApiTransferProofList(apiTransferList: ApiTransferProofList): TransferProofList {
  return {
    data: apiTransferList.data.map(mapApiTransferProofSummary),
    pagination: {
      page: apiTransferList.pagination.page,
      limit: apiTransferList.pagination.limit,
      total: apiTransferList.pagination.total,
      totalPages: apiTransferList.pagination.total_pages,
    },
  };
}

async function fetchTransferProofList({
  status,
  page = 1,
  limit = 20,
}: {
  status?: 'pending' | ProcessedTransferStatus;
  page?: number;
  limit?: number;
}): Promise<TransferProofList> {
  const response = await api.get<ApiTransferProofList>('/api/transfers', {
    params: {
      ...(status ? { status } : {}),
      page,
      limit,
    },
  });

  return mapApiTransferProofList(response.data);
}

export function getNextTransfersPageParam(lastPage: TransferProofList): number | undefined {
  if (lastPage.pagination.totalPages <= 0) {
    return undefined;
  }

  if (lastPage.pagination.page >= lastPage.pagination.totalPages) {
    return undefined;
  }

  return lastPage.pagination.page + 1;
}

export const transferQueryKeys = {
  all: ['transfers'] as const,
  list: (status?: string) => ['transfers', 'list', status ?? 'all'] as const,
  history: (status: ProcessedTransferStatus) => ['transfers', 'history', status] as const,
};

export function useTransfers(status?: 'pending' | 'confirmed' | 'rejected') {
  return useQuery({
    queryKey: transferQueryKeys.list(status),
    queryFn: async (): Promise<TransferProofList> => fetchTransferProofList({ status }),
    staleTime: 1000 * 30,
  });
}

export function useInfiniteTransfers(status: ProcessedTransferStatus) {
  return useInfiniteQuery({
    queryKey: transferQueryKeys.history(status),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<TransferProofList> =>
      fetchTransferProofList({
        status,
        page: typeof pageParam === 'number' ? pageParam : 1,
        limit: 10,
      }),
    getNextPageParam: getNextTransfersPageParam,
    staleTime: 1000 * 30,
  });
}

export function useUploadTransferProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proofId, file }: { proofId: string; file: File }) => {
      const response = await uploadTransferProof(proofId, file);
      return response.data as ApiUploadTransferProofResponse;
    },
    onSuccess: async () => {
      await invalidateOperationalQueries(queryClient, { includeTransfers: true });
    },
  });
}

export function useValidateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ValidateTransferInput) => {
      const response = await api.patch(`/api/transfers/${input.proofId}/validate`, {
        action: input.action,
        reason: input.reason,
      });
      return response.data;
    },
    onSuccess: async () => {
      await invalidateOperationalQueries(queryClient, { includeTransfers: true });
    },
  });
}
