/**
 * Budget Line Items API Contract
 * @feature 029-budget-vendor-integration
 *
 * Defines the interface for budget line item operations with vendor invoice integration.
 */

// =============================================================================
// Types
// =============================================================================

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface BudgetLineItem {
  id: string;
  categoryId: string;
  vendorId: string | null;
  vendorInvoiceId: string | null;
  description: string;
  projectedCost: number;
  actualCost: number;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Database row format
export interface BudgetLineItemRow {
  id: string;
  category_id: string;
  vendor_id: string | null;
  vendor_invoice_id: string | null;
  description: string;
  projected_cost: number;
  actual_cost: number;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// With joined invoice data
export interface BudgetLineItemWithInvoice extends BudgetLineItem {
  vendorInvoice?: {
    id: string;
    invoiceNumber: string;
    amount: number;
    vatAmount: number;
  } | null;
}

// =============================================================================
// Transformers
// =============================================================================

export function transformBudgetLineItem(row: BudgetLineItemRow): BudgetLineItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    vendorId: row.vendor_id,
    vendorInvoiceId: row.vendor_invoice_id,
    description: row.description,
    projectedCost: row.projected_cost ?? 0,
    actualCost: row.actual_cost ?? 0,
    paymentStatus: row.payment_status ?? 'unpaid',
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// =============================================================================
// Query Contracts
// =============================================================================

/**
 * Fetch budget line items for a category
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('budget_line_items')
 *   .select('*')
 *   .eq('category_id', categoryId)
 *   .order('created_at', { ascending: false });
 * ```
 */
export interface FetchBudgetLineItemsContract {
  input: { categoryId: string };
  output: BudgetLineItem[];
  error: Error;
}

/**
 * Fetch budget line item by invoice ID
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('budget_line_items')
 *   .select('*')
 *   .eq('vendor_invoice_id', invoiceId)
 *   .single();
 * ```
 */
export interface FetchBudgetLineItemByInvoiceContract {
  input: { invoiceId: string };
  output: BudgetLineItem | null;
  error: Error;
}

// =============================================================================
// Mutation Contracts
// =============================================================================

export interface CreateBudgetLineItemInput {
  categoryId: string;
  vendorId: string;
  vendorInvoiceId: string;
  description: string;
  projectedCost: number;
  actualCost?: number;
  paymentStatus?: PaymentStatus;
  notes?: string | null;
}

/**
 * Create a budget line item for an invoice
 *
 * Called automatically when creating an invoice with budget integration.
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('budget_line_items')
 *   .insert({
 *     category_id: input.categoryId,
 *     vendor_id: input.vendorId,
 *     vendor_invoice_id: input.vendorInvoiceId,
 *     description: input.description,
 *     projected_cost: input.projectedCost,
 *     actual_cost: input.actualCost ?? 0,
 *     payment_status: input.paymentStatus ?? 'unpaid',
 *     notes: input.notes,
 *   })
 *   .select()
 *   .single();
 * ```
 */
export interface CreateBudgetLineItemContract {
  input: CreateBudgetLineItemInput;
  output: BudgetLineItem;
  error: Error;
}

export interface UpdateBudgetLineItemPaymentInput {
  lineItemId?: string;
  vendorInvoiceId?: string;
  actualCost: number;
  paymentStatus: PaymentStatus;
}

/**
 * Update budget line item payment status
 *
 * Called automatically when recording a payment.
 *
 * @example
 * ```typescript
 * // By line item ID
 * const { data, error } = await supabase
 *   .from('budget_line_items')
 *   .update({
 *     actual_cost: input.actualCost,
 *     payment_status: input.paymentStatus,
 *   })
 *   .eq('id', input.lineItemId)
 *   .select()
 *   .single();
 *
 * // Or by invoice ID
 * const { data, error } = await supabase
 *   .from('budget_line_items')
 *   .update({
 *     actual_cost: input.actualCost,
 *     payment_status: input.paymentStatus,
 *   })
 *   .eq('vendor_invoice_id', input.vendorInvoiceId)
 *   .select()
 *   .single();
 * ```
 */
export interface UpdateBudgetLineItemPaymentContract {
  input: UpdateBudgetLineItemPaymentInput;
  output: BudgetLineItem;
  error: Error;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Determine payment status based on amounts
 */
export function determinePaymentStatus(
  totalPaid: number,
  invoiceTotal: number
): PaymentStatus {
  if (totalPaid >= invoiceTotal) {
    return 'paid';
  }
  if (totalPaid > 0) {
    return 'partially_paid';
  }
  return 'unpaid';
}

/**
 * Calculate remaining balance on an invoice
 */
export function calculateRemainingBalance(
  invoiceTotal: number,
  totalPaid: number
): number {
  return Math.max(0, invoiceTotal - totalPaid);
}

/**
 * Validate payment amount doesn't exceed remaining balance
 */
export function validatePaymentAmount(
  paymentAmount: number,
  invoiceTotal: number,
  alreadyPaid: number
): string | null {
  const remaining = calculateRemainingBalance(invoiceTotal, alreadyPaid);
  if (paymentAmount > remaining) {
    return `Payment amount (R ${paymentAmount.toFixed(2)}) exceeds remaining balance (R ${remaining.toFixed(2)})`;
  }
  return null;
}

// =============================================================================
// Validation
// =============================================================================

import { z } from 'zod';

export const budgetLineItemSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  vendorId: z.string().uuid('Invalid vendor ID'),
  vendorInvoiceId: z.string().uuid('Invalid invoice ID'),
  description: z.string().min(1, 'Description is required'),
  projectedCost: z.number().min(0, 'Cost must be positive'),
  actualCost: z.number().min(0, 'Cost must be positive').optional(),
  paymentStatus: z.enum(['unpaid', 'partially_paid', 'paid']).optional(),
  notes: z.string().optional().nullable(),
});

export const updatePaymentSchema = z.object({
  actualCost: z.number().min(0, 'Amount must be positive'),
  paymentStatus: z.enum(['unpaid', 'partially_paid', 'paid']),
});
