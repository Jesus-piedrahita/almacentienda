/**
 * @fileoverview Tipos TypeScript para el módulo de clientes.
 * Define las interfaces para clientes, deudas y estadísticas.
 */

/**
 * Cliente del sistema
 */
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  rfc?: string;
  isActive: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Datos para crear un nuevo cliente
 */
export interface CreateClientInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  rfc?: string;
}

/**
 * Datos para actualizar un cliente
 */
export interface UpdateClientInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  rfc?: string;
  is_active?: number;
}

/**
 * Deuda de un cliente por producto fiado
 */
export interface ClientDebt {
  id: string;
  clientId: string;
  productId: string;
  productName: string;
  saleId?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  isPaid: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Cliente con sus deudas
 */
export interface ClientWithDebts {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  rfc?: string;
  isActive: number;
  createdAt: string;
  debts: ClientDebt[];
  totalDebt: number;
}

/**
 * Cliente en el top de deudores
 */
export interface TopClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalDebt: number;
  debtCount: number;
}

/**
 * Estadísticas de clientes
 */
export interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalDebt: number;
  clientsWithDebt: number;
  topClients: TopClient[];
}

/**
 * Ítem individual dentro de una venta fiada agrupada en cuenta corriente.
 */
export interface CreditSaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Abono registrado sobre una venta o sobre el bloque legado sin ticket.
 */
export interface DebtPayment {
  id: string;
  clientId: string;
  saleId: string | null;
  amount: number;
  note?: string;
  createdAt: string;
}

/**
 * Grupo de cuenta corriente agrupado por venta.
 */
export interface CreditSaleGroup {
  saleId: string | null;
  saleDate: string | null;
  label?: string;
  items: CreditSaleItem[];
  totalSale: number;
  totalPaid: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid';
  payments: DebtPayment[];
}

/**
 * Respuesta completa de cuenta corriente agrupada del cliente.
 */
export interface ClientCreditAccount {
  clientId: string;
  clientName: string;
  totalDebt: number;
  totalPaid: number;
  balance: number;
  sales: CreditSaleGroup[];
}

/**
 * Input para registrar un abono.
 */
export interface RegisterPaymentInput {
  saleId: string | null;
  amount: number;
  note?: string;
}
