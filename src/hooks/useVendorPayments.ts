/**
 * useVendorPayments Hook - TanStack Query hooks for vendor payment schedule data
 * @feature 009-vendor-payments-invoices
 * T013: Fetch payments for vendor
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VendorPaymentSchedule, PaymentWithInvoice } from '@/types/vendor';

// =============================================================================
// Fetch All Payments for Vendor
// =============================================================================

interface UseVendorPaymentsReturn {
  payments: VendorPaymentSchedule[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchVendorPayments(vendorId: string): Promise<VendorPaymentSchedule[]> {
  const { data, error } = await supabase
    .from('vendor_payment_schedule')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching vendor payments:', error);
    throw error;
  }

  return data || [];
}

/**
 * Hook to fetch all payment milestones for a vendor
 * Sorted by due_date ascending (nearest due first)
 */
export function useVendorPayments(vendorId: string | undefined): UseVendorPaymentsReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['vendor-payments', vendorId],
    queryFn: () => fetchVendorPayments(vendorId!),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    payments: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// T015: Fetch Payments with Linked Invoice Info (Phase 010)
// =============================================================================

interface UseVendorPaymentsWithInvoicesReturn {
  payments: PaymentWithInvoice[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchVendorPaymentsWithInvoices(vendorId: string): Promise<PaymentWithInvoice[]> {
  // Step 1: Fetch all payments for the vendor
  const { data: payments, error: paymentsError } = await supabase
    .from('vendor_payment_schedule')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('due_date', { ascending: true });

  if (paymentsError) {
    console.error('Error fetching vendor payments:', paymentsError);
    throw paymentsError;
  }

  if (!payments || payments.length === 0) {
    return [];
  }

  // Step 2: Get payment IDs and fetch linked invoices
  const paymentIds = payments.map((p) => p.id);
  const { data: invoices, error: invoicesError } = await supabase
    .from('vendor_invoices')
    .select('id, invoice_number, payment_schedule_id')
    .in('payment_schedule_id', paymentIds);

  if (invoicesError) {
    console.error('Error fetching linked invoices:', invoicesError);
    // Don't throw - just return payments without invoice info
    return payments.map((payment) => ({ ...payment, linkedInvoice: null }));
  }

  // Step 3: Build a map of payment_schedule_id -> invoice info
  const invoiceByPaymentId = new Map<string, { id: string; invoice_number: string }>();
  invoices?.forEach((inv) => {
    if (inv.payment_schedule_id) {
      invoiceByPaymentId.set(inv.payment_schedule_id, {
        id: inv.id,
        invoice_number: inv.invoice_number,
      });
    }
  });

  // Step 4: Return payments with linked invoice info
  return payments.map((payment) => ({
    ...payment,
    linkedInvoice: invoiceByPaymentId.get(payment.id) || null,
  }));
}

/**
 * T015: Hook to fetch all payment milestones with linked invoice info
 * Returns payments extended with linkedInvoice for display in the table
 */
export function useVendorPaymentsWithInvoices(vendorId: string | undefined): UseVendorPaymentsWithInvoicesReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['vendor-payments-with-invoices', vendorId],
    queryFn: () => fetchVendorPaymentsWithInvoices(vendorId!),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    payments: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Fetch Single Payment
// =============================================================================

interface UseVendorPaymentReturn {
  payment: VendorPaymentSchedule | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

async function fetchVendorPayment(paymentId: string): Promise<VendorPaymentSchedule | null> {
  const { data, error } = await supabase
    .from('vendor_payment_schedule')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error) {
    console.error('Error fetching vendor payment:', error);
    throw error;
  }

  return data;
}

/**
 * Hook to fetch a single payment by ID
 */
export function useVendorPayment(paymentId: string | undefined): UseVendorPaymentReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendor-payment', paymentId],
    queryFn: () => fetchVendorPayment(paymentId!),
    enabled: !!paymentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    payment: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

// =============================================================================
// Payment Summary Statistics
// =============================================================================

export interface PaymentSummary {
  totalPayments: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  amountPaid: number;
  amountPending: number;
  amountOverdue: number;
}

/**
 * Calculate payment summary statistics from payment list
 */
export function calculatePaymentSummary(payments: VendorPaymentSchedule[]): PaymentSummary {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return payments.reduce(
    (summary, payment) => {
      const isPaid = payment.paid_date || payment.status === 'paid';
      const dueDate = new Date(payment.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const isOverdue = !isPaid && dueDate < today && payment.status !== 'cancelled';

      summary.totalPayments++;

      if (isPaid) {
        summary.totalPaid++;
        summary.amountPaid += payment.amount;
      } else if (isOverdue) {
        summary.totalOverdue++;
        summary.amountOverdue += payment.amount;
      } else if (payment.status !== 'cancelled') {
        summary.totalPending++;
        summary.amountPending += payment.amount;
      }

      return summary;
    },
    {
      totalPayments: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      amountPaid: 0,
      amountPending: 0,
      amountOverdue: 0,
    }
  );
}
