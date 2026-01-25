/**
 * useVendorTotals Hook - TanStack Query hook for vendor financial totals
 * @feature 010-invoice-payment-integration
 * T003: Calculate vendor financial summary from invoices and payments
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VendorTotals } from '@/types/vendor';

// =============================================================================
// Fetch Vendor Totals
// =============================================================================

interface UseVendorTotalsReturn {
  totals: VendorTotals | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchVendorTotals(vendorId: string): Promise<VendorTotals> {
  // Query 1: Sum of all invoice totals (excluding cancelled)
  const { data: invoices, error: invoiceError } = await supabase
    .from('vendor_invoices')
    .select('total_amount')
    .eq('vendor_id', vendorId)
    .neq('status', 'cancelled');

  if (invoiceError) {
    console.error('Error fetching vendor invoices for totals:', invoiceError);
    throw invoiceError;
  }

  const totalInvoiced = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) ?? 0;

  // Query 2: Sum of paid payments only
  const { data: payments, error: paymentError } = await supabase
    .from('vendor_payment_schedule')
    .select('amount')
    .eq('vendor_id', vendorId)
    .eq('status', 'paid');

  if (paymentError) {
    console.error('Error fetching vendor payments for totals:', paymentError);
    throw paymentError;
  }

  const totalPaid = payments?.reduce((sum, pay) => sum + (pay.amount || 0), 0) ?? 0;

  // Calculate balance
  const balanceDue = totalInvoiced - totalPaid;

  return { totalInvoiced, totalPaid, balanceDue };
}

/**
 * Hook to fetch financial totals for a vendor
 * Returns: totalInvoiced, totalPaid, balanceDue
 */
export function useVendorTotals(vendorId: string | undefined): UseVendorTotalsReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['vendor-totals', vendorId],
    queryFn: () => fetchVendorTotals(vendorId!),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    totals: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export default useVendorTotals;
