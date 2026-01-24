/**
 * useVendorInvoiceMutations Hook - TanStack Query mutations for vendor invoices
 * @feature 009-vendor-payments-invoices
 * @feature 029-budget-vendor-integration
 * T036: Create, update, delete invoice mutations
 * T019-T021: Invoice creation with budget line item integration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { VendorInvoice, VendorInvoiceFormData, InvoiceStatus } from '@/types/vendor';
import { calculateVAT } from '@/lib/vendorInvoiceStatus';
import { logActivity, activityDescriptions } from '@/lib/activityLog';

// =============================================================================
// Create Invoice Mutation
// =============================================================================

interface CreateInvoiceVariables {
  vendorId: string;
  data: VendorInvoiceFormData;
}

async function createInvoice({ vendorId, data }: CreateInvoiceVariables): Promise<VendorInvoice> {
  // Get wedding_id from vendor for activity logging
  const { data: vendor } = await supabase
    .from('vendors')
    .select('wedding_id')
    .eq('id', vendorId)
    .single();

  const vatAmount = calculateVAT(data.amount);
  const invoiceTotal = data.amount + vatAmount;

  // Step 1: Create invoice
  const { data: invoice, error } = await supabase
    .from('vendor_invoices')
    .insert({
      vendor_id: vendorId,
      payment_schedule_id: data.payment_schedule_id || null,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      amount: data.amount,
      vat_amount: vatAmount,
      // total_amount is a generated column - computed automatically by DB
      status: 'unpaid',
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }

  // T019-T020: Step 2: Create budget line item if budget category is provided
  if (data.budget_category_id) {
    const { error: lineItemError } = await supabase
      .from('budget_line_items')
      .insert({
        budget_category_id: data.budget_category_id,
        vendor_id: vendorId,
        vendor_invoice_id: invoice.id,
        item_description: `Invoice ${data.invoice_number}`,
        projected_cost: invoiceTotal, // Invoice total as projected cost
        actual_cost: 0, // No payments yet
        payment_status: 'unpaid',
        notes: data.notes || null,
      });

    if (lineItemError) {
      // T021: Log error but don't fail the invoice creation
      console.error('Error creating budget line item:', lineItemError);
      // Note: Invoice was created successfully, budget line item failed
      // In production, consider rolling back or alerting user
    }
  }

  // Log activity (fire-and-forget)
  if (vendor) {
    logActivity({
      weddingId: vendor.wedding_id,
      actionType: 'created',
      entityType: 'invoice',
      entityId: invoice.id,
      description: activityDescriptions.invoice.created(invoice.invoice_number),
    });
  }

  return invoice;
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
      // T014: Also invalidate totals when invoice is created
      queryClient.invalidateQueries({ queryKey: ['vendor-totals', variables.vendorId] });
      // T019: Invalidate budget categories when budget line item is created
      if (variables.data.budget_category_id) {
        // Invalidate all budget-related queries to reflect new line item
        queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
        queryClient.invalidateQueries({ queryKey: ['budget-line-items'] });
      }
      toast.success('Invoice added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add invoice', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// Update Invoice Mutation
// =============================================================================

interface UpdateInvoiceVariables {
  invoiceId: string;
  vendorId: string;
  data: Partial<VendorInvoiceFormData>;
}

async function updateInvoice({ invoiceId, vendorId, data }: UpdateInvoiceVariables): Promise<VendorInvoice> {
  // Get wedding_id from vendor for activity logging
  const { data: vendor } = await supabase
    .from('vendors')
    .select('wedding_id')
    .eq('id', vendorId)
    .single();

  const updateData: Record<string, unknown> = {};

  // Only include fields that are provided
  if (data.invoice_number !== undefined) updateData.invoice_number = data.invoice_number;
  if (data.invoice_date !== undefined) updateData.invoice_date = data.invoice_date;
  if (data.due_date !== undefined) updateData.due_date = data.due_date;
  if (data.payment_schedule_id !== undefined) updateData.payment_schedule_id = data.payment_schedule_id || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  // Recalculate VAT if amount changed (total_amount is a generated column)
  if (data.amount !== undefined) {
    updateData.amount = data.amount;
    updateData.vat_amount = calculateVAT(data.amount);
  }

  const { data: invoice, error } = await supabase
    .from('vendor_invoices')
    .update(updateData)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }

  // Log activity (fire-and-forget)
  if (vendor) {
    logActivity({
      weddingId: vendor.wedding_id,
      actionType: 'updated',
      entityType: 'invoice',
      entityId: invoiceId,
      description: activityDescriptions.invoice.updated(invoice.invoice_number),
      changes: data as unknown as Record<string, unknown>,
    });
  }

  return invoice;
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
      // T014: Also invalidate totals when invoice amount changes
      queryClient.invalidateQueries({ queryKey: ['vendor-totals', variables.vendorId] });
      toast.success('Invoice updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update invoice', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// Delete Invoice Mutation
// =============================================================================

interface DeleteInvoiceVariables {
  invoiceId: string;
  vendorId: string;
}

async function deleteInvoice({ invoiceId, vendorId }: DeleteInvoiceVariables): Promise<void> {
  // Get invoice info and wedding_id before deleting for activity log
  const { data: invoice } = await supabase
    .from('vendor_invoices')
    .select('invoice_number')
    .eq('id', invoiceId)
    .single();

  const { data: vendor } = await supabase
    .from('vendors')
    .select('wedding_id')
    .eq('id', vendorId)
    .single();

  const { error } = await supabase
    .from('vendor_invoices')
    .delete()
    .eq('id', invoiceId);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }

  // Log activity (fire-and-forget)
  if (invoice && vendor) {
    logActivity({
      weddingId: vendor.wedding_id,
      actionType: 'deleted',
      entityType: 'invoice',
      entityId: invoiceId,
      description: activityDescriptions.invoice.deleted(invoice.invoice_number),
    });
  }
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
      // T014: Also invalidate totals when invoice is deleted
      queryClient.invalidateQueries({ queryKey: ['vendor-totals', variables.vendorId] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete invoice', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// Mark Invoice as Paid Mutation
// =============================================================================

interface MarkInvoicePaidVariables {
  invoiceId: string;
  vendorId: string;
  paidDate: string;
  paymentMethod?: string;
  paymentReference?: string;
}

async function markInvoicePaid({
  invoiceId,
  paidDate,
  paymentMethod,
  paymentReference,
}: MarkInvoicePaidVariables): Promise<VendorInvoice> {
  const { data: invoice, error } = await supabase
    .from('vendor_invoices')
    .update({
      status: 'paid',
      paid_date: paidDate,
      payment_method: paymentMethod || null,
      payment_reference: paymentReference || null,
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error marking invoice as paid:', error);
    throw error;
  }

  return invoice;
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markInvoicePaid,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-totals', variables.vendorId] });
      toast.success('Invoice marked as paid');
    },
    onError: (error) => {
      toast.error('Failed to mark invoice as paid', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// T005: Update Invoice Status Mutation (Phase 010)
// =============================================================================

interface UpdateInvoiceStatusVariables {
  invoiceId: string;
  vendorId: string;
  status: InvoiceStatus;
  paidDate?: string | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
}

async function updateInvoiceStatus({
  invoiceId,
  status,
  paidDate,
  paymentMethod,
  paymentReference,
}: UpdateInvoiceStatusVariables): Promise<VendorInvoice> {
  const updateData: Record<string, unknown> = {
    status,
  };

  // Only set paid details if marking as paid
  if (status === 'paid' || status === 'partially_paid') {
    updateData.paid_date = paidDate || null;
    updateData.payment_method = paymentMethod || null;
    updateData.payment_reference = paymentReference || null;
  } else {
    // Clear paid details if reverting to unpaid/overdue
    updateData.paid_date = null;
    updateData.payment_method = null;
    updateData.payment_reference = null;
  }

  const { data: invoice, error } = await supabase
    .from('vendor_invoices')
    .update(updateData)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }

  return invoice;
}

/**
 * T005: Update invoice status directly
 * Used by payment mutations to sync invoice status when payment is marked as paid
 */
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoiceStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-totals', variables.vendorId] });
      toast.success(`Invoice status updated to ${variables.status}`);
    },
    onError: (error) => {
      toast.error('Failed to update invoice status', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}
