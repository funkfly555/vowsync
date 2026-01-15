/**
 * useVendorPayments Hook - TanStack Query hooks for vendor payment schedule data
 * @feature 009-vendor-payments-invoices
 * T013: Fetch payments for vendor
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VendorPaymentSchedule } from '@/types/vendor';

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
