/**
 * useVendorPaymentMutations Hook - TanStack Query mutations for vendor payments
 * @feature 009-vendor-payments-invoices
 * T020: Create payment mutation
 * T023: Mark as paid mutation
 * T026: Update payment mutation
 * T029: Delete payment mutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { VendorPaymentSchedule, VendorPaymentScheduleFormData, MarkAsPaidFormData, VendorInvoice } from '@/types/vendor';
import { calculateInvoiceStatusFromPayment } from '@/lib/vendorInvoiceStatus';
import { logActivity, activityDescriptions } from '@/lib/activityLog';

// =============================================================================
// T020: Create Payment Mutation
// =============================================================================

interface CreatePaymentVariables {
  vendorId: string;
  data: VendorPaymentScheduleFormData;
}

async function createPayment({ vendorId, data }: CreatePaymentVariables): Promise<VendorPaymentSchedule> {
  // Get wedding_id from vendor for activity logging
  const { data: vendor } = await supabase
    .from('vendors')
    .select('wedding_id')
    .eq('id', vendorId)
    .single();

  const { data: payment, error } = await supabase
    .from('vendor_payment_schedule')
    .insert({
      vendor_id: vendorId,
      milestone_name: data.milestone_name,
      due_date: data.due_date,
      amount: data.amount,
      percentage: data.percentage || null,
      notes: data.notes || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating payment:', error);
    throw error;
  }

  // Log activity (fire-and-forget)
  if (vendor) {
    logActivity({
      weddingId: vendor.wedding_id,
      actionType: 'created',
      entityType: 'payment',
      entityId: payment.id,
      description: activityDescriptions.payment.created(`R ${data.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} - ${data.milestone_name}`),
    });
  }

  return payment;
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-payments-with-invoices', variables.vendorId] });
      // T014: Also invalidate totals when payment is created
      queryClient.invalidateQueries({ queryKey: ['vendor-totals', variables.vendorId] });
      toast.success('Payment added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add payment', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// T004: Create Payment from Invoice Mutation (Phase 010)
// =============================================================================

interface CreatePaymentFromInvoiceVariables {
  vendorId: string;
  invoice: VendorInvoice;
  data: VendorPaymentScheduleFormData;
  markAsPaid?: boolean; // If true, auto-mark payment as paid and update invoice status
  paidDate?: string; // Date when payment was made (required if markAsPaid is true)
}

interface CreatePaymentFromInvoiceResult {
  payment: VendorPaymentSchedule;
  invoice: VendorInvoice;
}

async function createPaymentFromInvoice({
  vendorId,
  invoice,
  data,
  markAsPaid = true, // Default to marking as paid for "Pay This Invoice" workflow
  paidDate,
}: CreatePaymentFromInvoiceVariables): Promise<CreatePaymentFromInvoiceResult> {
  const today = new Date().toISOString().split('T')[0];
  const paymentPaidDate = paidDate || today;

  // Step 1: Create the payment (auto-mark as paid if markAsPaid is true)
  const { data: payment, error: paymentError } = await supabase
    .from('vendor_payment_schedule')
    .insert({
      vendor_id: vendorId,
      milestone_name: data.milestone_name,
      due_date: data.due_date,
      amount: data.amount,
      percentage: data.percentage || null,
      notes: data.notes || null,
      status: markAsPaid ? 'paid' : 'pending',
      paid_date: markAsPaid ? paymentPaidDate : null,
    })
    .select()
    .single();

  if (paymentError) {
    console.error('Error creating payment from invoice:', paymentError);
    throw paymentError;
  }

  // Step 2: Calculate the new invoice status based on payment amount
  // Use the existing helper to determine if payment covers full invoice or partial
  const newInvoiceStatus = markAsPaid
    ? calculateInvoiceStatusFromPayment(data.amount, invoice.total_amount)
    : invoice.status; // Keep original status if not marking as paid

  // Step 3: Link the invoice to the payment AND update its status
  const { data: updatedInvoice, error: invoiceError } = await supabase
    .from('vendor_invoices')
    .update({
      payment_schedule_id: payment.id,
      status: newInvoiceStatus,
      paid_date: newInvoiceStatus === 'paid' ? paymentPaidDate : null,
    })
    .eq('id', invoice.id)
    .select()
    .single();

  if (invoiceError) {
    console.error('Error linking invoice to payment:', invoiceError);
    // Rollback: delete the created payment
    await supabase.from('vendor_payment_schedule').delete().eq('id', payment.id);
    throw invoiceError;
  }

  return { payment, invoice: updatedInvoice };
}

/**
 * T004: Create a payment from an invoice with automatic linking
 * - Creates a new payment with pre-filled values from invoice
 * - Links the invoice to the newly created payment via payment_schedule_id
 */
export function useCreatePaymentFromInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentFromInvoice,
    onSuccess: (result, variables) => {
      // Invalidate both payments and invoices queries
      // Note: Must invalidate both 'vendor-payments' AND 'vendor-payments-with-invoices'
      // since PaymentsTab uses the latter query key
      queryClient.invalidateQueries({ queryKey: ['vendor-payments', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-payments-with-invoices', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-totals', variables.vendorId] });

      // Show appropriate success message based on whether payment was marked as paid
      if (variables.markAsPaid !== false) {
        const statusText = result.invoice.status === 'paid'
          ? 'fully paid'
          : result.invoice.status === 'partially_paid'
            ? 'partially paid'
            : 'payment recorded';
        toast.success(`Invoice ${statusText}`, {
          description: `Payment of R ${variables.data.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} recorded`,
        });
      } else {
        toast.success('Payment scheduled and linked to invoice');
      }
    },
    onError: (error) => {
      toast.error('Failed to create payment from invoice', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// T023: Mark as Paid Mutation
// =============================================================================

interface MarkAsPaidVariables {
  paymentId: string;
  vendorId: string;
  data: MarkAsPaidFormData;
}

interface MarkAsPaidResult {
  payment: VendorPaymentSchedule;
  updatedInvoice: VendorInvoice | null;
}

/**
 * T006: Extended to update linked invoice status when payment is marked as paid
 */
async function markPaymentAsPaid({ paymentId, vendorId, data }: MarkAsPaidVariables): Promise<MarkAsPaidResult> {
  // Get wedding_id from vendor for activity logging
  const { data: vendor } = await supabase
    .from('vendors')
    .select('wedding_id')
    .eq('id', vendorId)
    .single();

  // Step 1: Mark the payment as paid
  const { data: payment, error: paymentError } = await supabase
    .from('vendor_payment_schedule')
    .update({
      status: 'paid',
      paid_date: data.paid_date,
      payment_method: data.payment_method || null,
      payment_reference: data.payment_reference || null,
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (paymentError) {
    console.error('Error marking payment as paid:', paymentError);
    throw paymentError;
  }

  // Step 2: Find any invoice linked to this payment
  const { data: linkedInvoice } = await supabase
    .from('vendor_invoices')
    .select('*')
    .eq('payment_schedule_id', paymentId)
    .single();

  let updatedInvoice: VendorInvoice | null = null;

  // Step 3: If there's a linked invoice, update its status
  if (linkedInvoice) {
    // T019: Use helper to determine status based on payment amount vs invoice total
    const newStatus = calculateInvoiceStatusFromPayment(payment.amount, linkedInvoice.total_amount);

    const { data: invoice, error: invoiceError } = await supabase
      .from('vendor_invoices')
      .update({
        status: newStatus,
        paid_date: newStatus === 'paid' ? data.paid_date : null,
        payment_method: data.payment_method || null,
        payment_reference: data.payment_reference || null,
      })
      .eq('id', linkedInvoice.id)
      .select()
      .single();

    if (invoiceError) {
      console.error('Error updating linked invoice status:', invoiceError);
      // Don't throw - payment is already marked as paid, just log the error
    } else {
      updatedInvoice = invoice;
    }
  }

  // Log activity (fire-and-forget)
  if (vendor) {
    logActivity({
      weddingId: vendor.wedding_id,
      actionType: 'completed',
      entityType: 'payment',
      entityId: paymentId,
      description: activityDescriptions.payment.completed(`R ${payment.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} - ${payment.milestone_name}`),
    });
  }

  return { payment, updatedInvoice };
}

export function useMarkPaymentAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markPaymentAsPaid,
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-payments-with-invoices', variables.vendorId] });
      // T006: Also invalidate invoices and totals since invoice status may have changed
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-totals', variables.vendorId] });

      if (result.updatedInvoice) {
        toast.success('Payment marked as paid', {
          description: `Invoice ${result.updatedInvoice.invoice_number} status updated to ${result.updatedInvoice.status}`,
        });
      } else {
        toast.success('Payment marked as paid');
      }
    },
    onError: (error) => {
      toast.error('Failed to mark payment as paid', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// T026: Update Payment Mutation
// =============================================================================

interface UpdatePaymentVariables {
  paymentId: string;
  vendorId: string;
  data: Partial<VendorPaymentScheduleFormData>;
}

async function updatePayment({ paymentId, data }: UpdatePaymentVariables): Promise<VendorPaymentSchedule> {
  const updateData: Record<string, unknown> = {};

  // Only include fields that are provided
  if (data.milestone_name !== undefined) updateData.milestone_name = data.milestone_name;
  if (data.due_date !== undefined) updateData.due_date = data.due_date;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.percentage !== undefined) updateData.percentage = data.percentage || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  const { data: payment, error } = await supabase
    .from('vendor_payment_schedule')
    .update(updateData)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment:', error);
    throw error;
  }

  return payment;
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-payments-with-invoices', variables.vendorId] });
      toast.success('Payment updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update payment', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// T029: Delete Payment Mutation
// =============================================================================

interface DeletePaymentVariables {
  paymentId: string;
  vendorId: string;
}

async function deletePayment({ paymentId, vendorId }: DeletePaymentVariables): Promise<void> {
  // Get payment info and wedding_id before deleting for activity log
  const { data: payment } = await supabase
    .from('vendor_payment_schedule')
    .select('milestone_name, amount')
    .eq('id', paymentId)
    .single();

  const { data: vendor } = await supabase
    .from('vendors')
    .select('wedding_id')
    .eq('id', vendorId)
    .single();

  const { error } = await supabase
    .from('vendor_payment_schedule')
    .delete()
    .eq('id', paymentId);

  if (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }

  // Log activity (fire-and-forget)
  if (payment && vendor) {
    logActivity({
      weddingId: vendor.wedding_id,
      actionType: 'deleted',
      entityType: 'payment',
      entityId: paymentId,
      description: activityDescriptions.payment.deleted(`R ${payment.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} - ${payment.milestone_name}`),
    });
  }
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-payments-with-invoices', variables.vendorId] });
      // T014: Also invalidate totals and invoices when payment is deleted
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-totals', variables.vendorId] });
      toast.success('Payment deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete payment', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}
