/**
 * Vendor-Budget Integration API Contract
 * @feature 029-budget-vendor-integration
 *
 * Defines the integration patterns between vendors, invoices, and budget tracking.
 */

import { BudgetLineItem, PaymentStatus, determinePaymentStatus } from './budget-line-items';
import { BudgetCategoryWithType } from './budget-categories';

// =============================================================================
// Types
// =============================================================================

/**
 * Vendor with budget category reference
 */
export interface VendorWithBudgetCategory {
  id: string;
  companyName: string;
  defaultBudgetCategoryId: string | null;
  defaultBudgetCategory?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Invoice creation input with budget integration
 */
export interface CreateInvoiceWithBudgetInput {
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  vatAmount: number;
  notes?: string | null;
  budgetCategoryId: string; // Required for budget integration
}

/**
 * Payment recording input with budget update
 */
export interface RecordPaymentWithBudgetInput {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string | null;
}

/**
 * Budget impact preview for payment
 */
export interface BudgetImpactPreview {
  categoryId: string;
  categoryName: string;
  currentActual: number;
  newActual: number;
  changeAmount: number;
  newPercentageSpent: number;
  willTriggerWarning: boolean;
  willExceedBudget: boolean;
}

// =============================================================================
// Integration Workflows
// =============================================================================

/**
 * Invoice Creation Workflow
 *
 * 1. Create invoice in vendor_invoices
 * 2. Create budget line item linked to invoice
 * 3. Category and wedding totals auto-recalculate via triggers
 *
 * @example
 * ```typescript
 * async function createInvoiceWithBudget(input: CreateInvoiceWithBudgetInput) {
 *   // Step 1: Create invoice
 *   const { data: invoice, error: invoiceError } = await supabase
 *     .from('vendor_invoices')
 *     .insert({
 *       vendor_id: input.vendorId,
 *       invoice_number: input.invoiceNumber,
 *       invoice_date: input.invoiceDate,
 *       due_date: input.dueDate,
 *       amount: input.amount,
 *       vat_amount: input.vatAmount,
 *       notes: input.notes,
 *     })
 *     .select()
 *     .single();
 *
 *   if (invoiceError) throw invoiceError;
 *
 *   // Step 2: Create budget line item
 *   const invoiceTotal = input.amount + input.vatAmount;
 *   const { error: lineItemError } = await supabase
 *     .from('budget_line_items')
 *     .insert({
 *       category_id: input.budgetCategoryId,
 *       vendor_id: input.vendorId,
 *       vendor_invoice_id: invoice.id,
 *       description: `Invoice ${input.invoiceNumber}`,
 *       projected_cost: invoiceTotal,
 *       actual_cost: 0,
 *       payment_status: 'unpaid',
 *     });
 *
 *   if (lineItemError) throw lineItemError;
 *
 *   // Step 3: Triggers handle totals recalculation
 *   return invoice;
 * }
 * ```
 */
export interface CreateInvoiceWithBudgetContract {
  input: CreateInvoiceWithBudgetInput;
  output: {
    invoice: {
      id: string;
      invoiceNumber: string;
      total: number;
    };
    lineItem: BudgetLineItem;
  };
  error: Error;
}

/**
 * Payment Recording Workflow
 *
 * 1. Create payment in vendor_payment_schedule
 * 2. Calculate new total paid
 * 3. Update budget line item actual_cost and payment_status
 * 4. Update invoice status
 * 5. Category and wedding totals auto-recalculate via triggers
 *
 * @example
 * ```typescript
 * async function recordPaymentWithBudget(input: RecordPaymentWithBudgetInput) {
 *   // Step 1: Get invoice and existing payments
 *   const { data: invoice } = await supabase
 *     .from('vendor_invoices')
 *     .select('*, payments:vendor_payment_schedule(*)')
 *     .eq('id', input.invoiceId)
 *     .single();
 *
 *   const invoiceTotal = invoice.amount + invoice.vat_amount;
 *   const existingPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
 *
 *   // Validate payment doesn't exceed remaining
 *   const remaining = invoiceTotal - existingPaid;
 *   if (input.amount > remaining) {
 *     throw new Error(`Payment exceeds remaining balance of R ${remaining.toFixed(2)}`);
 *   }
 *
 *   // Step 2: Create payment
 *   const { data: payment } = await supabase
 *     .from('vendor_payment_schedule')
 *     .insert({
 *       invoice_id: input.invoiceId,
 *       amount: input.amount,
 *       payment_date: input.paymentDate,
 *       payment_method: input.paymentMethod,
 *       reference_number: input.referenceNumber,
 *       notes: input.notes,
 *       status: 'completed',
 *     })
 *     .select()
 *     .single();
 *
 *   // Step 3: Calculate new status
 *   const newTotalPaid = existingPaid + input.amount;
 *   const newStatus = determinePaymentStatus(newTotalPaid, invoiceTotal);
 *
 *   // Step 4: Update budget line item
 *   await supabase
 *     .from('budget_line_items')
 *     .update({
 *       actual_cost: newTotalPaid,
 *       payment_status: newStatus,
 *     })
 *     .eq('vendor_invoice_id', input.invoiceId);
 *
 *   // Step 5: Update invoice status
 *   await supabase
 *     .from('vendor_invoices')
 *     .update({ status: newStatus })
 *     .eq('id', input.invoiceId);
 *
 *   // Step 6: Triggers handle totals recalculation
 *   return { payment, newStatus };
 * }
 * ```
 */
export interface RecordPaymentWithBudgetContract {
  input: RecordPaymentWithBudgetInput;
  output: {
    payment: {
      id: string;
      amount: number;
    };
    newPaymentStatus: PaymentStatus;
    newTotalPaid: number;
  };
  error: Error;
}

// =============================================================================
// Budget Impact Calculations
// =============================================================================

/**
 * Calculate budget impact preview before recording payment
 */
export function calculateBudgetImpactPreview(
  category: BudgetCategoryWithType,
  paymentAmount: number
): BudgetImpactPreview {
  const currentActual = category.actualAmount || 0;
  const newActual = currentActual + paymentAmount;
  const projected = category.projectedAmount || 0;
  const newPercentageSpent = projected > 0 ? (newActual / projected) * 100 : 0;

  return {
    categoryId: category.id,
    categoryName: category.name,
    currentActual,
    newActual,
    changeAmount: paymentAmount,
    newPercentageSpent,
    willTriggerWarning: newPercentageSpent >= 90 && newPercentageSpent < 100,
    willExceedBudget: newActual > projected,
  };
}

// =============================================================================
// Vendor Default Category
// =============================================================================

/**
 * Update vendor's default budget category
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('vendors')
 *   .update({ default_budget_category_id: categoryId })
 *   .eq('id', vendorId)
 *   .select(`
 *     *,
 *     default_budget_category:budget_categories(id, name)
 *   `)
 *   .single();
 * ```
 */
export interface UpdateVendorDefaultCategoryContract {
  input: {
    vendorId: string;
    budgetCategoryId: string | null;
  };
  output: VendorWithBudgetCategory;
  error: Error;
}

/**
 * Fetch vendor's default budget category for invoice pre-fill
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('vendors')
 *   .select('default_budget_category_id')
 *   .eq('id', vendorId)
 *   .single();
 *
 * return data?.default_budget_category_id ?? null;
 * ```
 */
export interface GetVendorDefaultCategoryContract {
  input: { vendorId: string };
  output: string | null;
  error: Error;
}

// =============================================================================
// Invoice Deletion Workflow
// =============================================================================

/**
 * Invoice Deletion Workflow
 *
 * When an invoice is deleted, the associated budget line item is also deleted
 * via ON DELETE CASCADE. The database triggers then recalculate category and
 * wedding totals automatically.
 *
 * @example
 * ```typescript
 * async function deleteInvoice(invoiceId: string) {
 *   // Budget line item deleted automatically via CASCADE
 *   // Triggers recalculate category and wedding totals
 *   const { error } = await supabase
 *     .from('vendor_invoices')
 *     .delete()
 *     .eq('id', invoiceId);
 *
 *   if (error) throw error;
 * }
 * ```
 */
export interface DeleteInvoiceContract {
  input: { invoiceId: string };
  output: void;
  error: Error;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format currency in South African Rand
 */
export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculate VAT at 15%
 */
export function calculateVAT(amount: number): number {
  return amount * 0.15;
}

/**
 * Calculate invoice total (amount + VAT)
 */
export function calculateInvoiceTotal(amount: number, vatAmount: number): number {
  return amount + vatAmount;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get warning level for budget percentage
 */
export function getBudgetWarningLevel(
  percentageSpent: number
): 'normal' | 'warning' | 'danger' {
  if (percentageSpent >= 100) return 'danger';
  if (percentageSpent >= 90) return 'warning';
  return 'normal';
}
