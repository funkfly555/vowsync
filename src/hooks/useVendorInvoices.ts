/**
 * useVendorInvoices Hook - TanStack Query hooks for vendor invoice data
 * @feature 009-vendor-payments-invoices
 * T014: Fetch invoices for vendor
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VendorInvoice } from '@/types/vendor';

// =============================================================================
// Fetch All Invoices for Vendor
// =============================================================================

interface UseVendorInvoicesReturn {
  invoices: VendorInvoice[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchVendorInvoices(vendorId: string): Promise<VendorInvoice[]> {
  const { data, error } = await supabase
    .from('vendor_invoices')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('invoice_date', { ascending: false });

  if (error) {
    console.error('Error fetching vendor invoices:', error);
    throw error;
  }

  return data || [];
}

/**
 * Hook to fetch all invoices for a vendor
 * Sorted by invoice_date descending (newest first)
 */
export function useVendorInvoices(vendorId: string | undefined): UseVendorInvoicesReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['vendor-invoices', vendorId],
    queryFn: () => fetchVendorInvoices(vendorId!),
    enabled: !!vendorId,
  });

  return {
    invoices: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Fetch Single Invoice
// =============================================================================

interface UseVendorInvoiceReturn {
  invoice: VendorInvoice | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

async function fetchVendorInvoice(invoiceId: string): Promise<VendorInvoice | null> {
  const { data, error } = await supabase
    .from('vendor_invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error) {
    console.error('Error fetching vendor invoice:', error);
    throw error;
  }

  return data;
}

/**
 * Hook to fetch a single invoice by ID
 */
export function useVendorInvoice(invoiceId: string | undefined): UseVendorInvoiceReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendor-invoice', invoiceId],
    queryFn: () => fetchVendorInvoice(invoiceId!),
    enabled: !!invoiceId,
  });

  return {
    invoice: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

// =============================================================================
// Invoice Summary Statistics
// =============================================================================

export interface InvoiceSummary {
  totalInvoices: number;
  totalPaid: number;
  totalUnpaid: number;
  totalOverdue: number;
  amountPaid: number;
  amountUnpaid: number;
  amountOverdue: number;
}

/**
 * Calculate invoice summary statistics from invoice list
 */
export function calculateInvoiceSummary(invoices: VendorInvoice[]): InvoiceSummary {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return invoices.reduce(
    (summary, invoice) => {
      const isPaid = invoice.paid_date || invoice.status === 'paid';
      const dueDate = new Date(invoice.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const isOverdue = !isPaid && dueDate < today && invoice.status !== 'cancelled';

      summary.totalInvoices++;

      if (isPaid) {
        summary.totalPaid++;
        summary.amountPaid += invoice.total_amount;
      } else if (isOverdue) {
        summary.totalOverdue++;
        summary.amountOverdue += invoice.total_amount;
      } else if (invoice.status !== 'cancelled') {
        summary.totalUnpaid++;
        summary.amountUnpaid += invoice.total_amount;
      }

      return summary;
    },
    {
      totalInvoices: 0,
      totalPaid: 0,
      totalUnpaid: 0,
      totalOverdue: 0,
      amountPaid: 0,
      amountUnpaid: 0,
      amountOverdue: 0,
    }
  );
}
