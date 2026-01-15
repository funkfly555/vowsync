/**
 * useVendorInvoiceMutations Hook - TanStack Query mutations for vendor invoices
 * @feature 009-vendor-payments-invoices
 * T036: Create, update, delete invoice mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { VendorInvoice, VendorInvoiceFormData } from '@/types/vendor';
import { calculateVAT, calculateTotal } from '@/lib/vendorInvoiceStatus';

// =============================================================================
// Create Invoice Mutation
// =============================================================================

interface CreateInvoiceVariables {
  vendorId: string;
  data: VendorInvoiceFormData;
}

async function createInvoice({ vendorId, data }: CreateInvoiceVariables): Promise<VendorInvoice> {
  const vatAmount = calculateVAT(data.amount);

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

  return invoice;
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
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

async function updateInvoice({ invoiceId, data }: UpdateInvoiceVariables): Promise<VendorInvoice> {
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

  return invoice;
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
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

async function deleteInvoice({ invoiceId }: DeleteInvoiceVariables): Promise<void> {
  const { error } = await supabase
    .from('vendor_invoices')
    .delete()
    .eq('id', invoiceId);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
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
      toast.success('Invoice marked as paid');
    },
    onError: (error) => {
      toast.error('Failed to mark invoice as paid', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}
