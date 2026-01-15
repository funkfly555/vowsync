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
import type { VendorPaymentSchedule, VendorPaymentScheduleFormData, MarkAsPaidFormData } from '@/types/vendor';

// =============================================================================
// T020: Create Payment Mutation
// =============================================================================

interface CreatePaymentVariables {
  vendorId: string;
  data: VendorPaymentScheduleFormData;
}

async function createPayment({ vendorId, data }: CreatePaymentVariables): Promise<VendorPaymentSchedule> {
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

  return payment;
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments', variables.vendorId] });
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
// T023: Mark as Paid Mutation
// =============================================================================

interface MarkAsPaidVariables {
  paymentId: string;
  vendorId: string;
  data: MarkAsPaidFormData;
}

async function markPaymentAsPaid({ paymentId, data }: MarkAsPaidVariables): Promise<VendorPaymentSchedule> {
  const { data: payment, error } = await supabase
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

  if (error) {
    console.error('Error marking payment as paid:', error);
    throw error;
  }

  return payment;
}

export function useMarkPaymentAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markPaymentAsPaid,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments', variables.vendorId] });
      toast.success('Payment marked as paid');
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

async function deletePayment({ paymentId }: DeletePaymentVariables): Promise<void> {
  const { error } = await supabase
    .from('vendor_payment_schedule')
    .delete()
    .eq('id', paymentId);

  if (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments', variables.vendorId] });
      toast.success('Payment deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete payment', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}
