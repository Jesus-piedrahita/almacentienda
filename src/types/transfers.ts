export const TRANSFER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
} as const;

export const TRANSFER_ACTION = {
  CONFIRM: 'confirm',
  REJECT: 'reject',
} as const;

export type TransferStatus = (typeof TRANSFER_STATUS)[keyof typeof TRANSFER_STATUS];
export type TransferAction = (typeof TRANSFER_ACTION)[keyof typeof TRANSFER_ACTION];

export interface TransferSaleContextItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface TransferSaleContext {
  saleId: string;
  createdAt: string;
  total: number;
  items: TransferSaleContextItem[];
}

export interface TransferProofSummary {
  id: string;
  status: TransferStatus;
  proofUrl: string | null;
  proofMimeType: string | null;
  proofFilename: string | null;
  referenceNote: string | null;
  clientName: string | null;
  saleContext: TransferSaleContext | null;
  createdAt: string;
  uploadedAt: string | null;
  validatedAt: string | null;
  validatedByUserId: string | null;
  saleId: string | null;
  debtPaymentId: string | null;
}

export interface TransferProofPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransferProofList {
  data: TransferProofSummary[];
  pagination: TransferProofPagination;
}

export interface ValidateTransferInput {
  proofId: string;
  action: TransferAction;
  reason?: string;
}
