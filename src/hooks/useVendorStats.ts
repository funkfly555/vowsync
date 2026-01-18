/**
 * Hook to fetch vendor invoice statistics for dashboard display
 * @feature 020-dashboard-settings-fix
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VendorStats, InvoiceStatusStats } from '@/types/dashboard';

/**
 * Fetches vendor invoice statistics for a wedding
 * - Overdue invoices (status='overdue' or past due_date, including partially_paid if overdue)
 * - Unpaid invoices (status='unpaid', not yet overdue)
 * - Partially Paid invoices (status='partially_paid', not yet overdue)
 * - Paid invoices (status='paid')
 */
export function useVendorStats(weddingId: string) {
  return useQuery({
    queryKey: ['vendorStats', weddingId],
    queryFn: async (): Promise<VendorStats> => {
      const emptyStats: InvoiceStatusStats = { count: 0, totalAmount: 0 };

      // Step 1: Count vendors for wedding
      const { count: vendorCount, error: vendorError } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('wedding_id', weddingId);

      if (vendorError) throw vendorError;

      const total = vendorCount ?? 0;

      // If no vendors, return early with defaults
      if (total === 0) {
        return {
          total: 0,
          pendingPayments: 0,
          overdue: emptyStats,
          unpaid: emptyStats,
          partiallyPaid: emptyStats,
          paid: emptyStats,
        };
      }

      // Step 2: Get vendor IDs for invoice query
      const { data: vendors, error: vendorsListError } = await supabase
        .from('vendors')
        .select('id')
        .eq('wedding_id', weddingId);

      if (vendorsListError) throw vendorsListError;

      const vendorIds = vendors?.map((v) => v.id) || [];

      // Step 3: Fetch all invoices with status, due_date, and total_amount
      let invoices: { status: string; due_date: string; total_amount: number }[] = [];
      if (vendorIds.length > 0) {
        const { data, error: invoicesError } = await supabase
          .from('vendor_invoices')
          .select('status, due_date, total_amount')
          .in('vendor_id', vendorIds)
          .neq('status', 'cancelled'); // Exclude cancelled invoices

        if (invoicesError) throw invoicesError;
        invoices = data ?? [];
      }

      // Step 4: Calculate invoice statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      // Helper to check if invoice is overdue based on due_date
      const isOverdue = (invoice: { due_date: string }) => {
        if (!invoice.due_date) return false;
        const dueDate = new Date(invoice.due_date);
        return dueDate < today;
      };

      // Filter invoices by status
      // Overdue: status='overdue' OR (unpaid/partially_paid with past due_date)
      const overdueInvoices = invoices.filter((inv) => {
        if (inv.status === 'overdue') return true;
        if ((inv.status === 'unpaid' || inv.status === 'partially_paid') && isOverdue(inv)) {
          return true;
        }
        return false;
      });

      // Unpaid: status='unpaid' and NOT overdue
      const unpaidInvoices = invoices.filter((inv) => {
        return inv.status === 'unpaid' && !isOverdue(inv);
      });

      // Partially Paid: status='partially_paid' and NOT overdue
      const partiallyPaidInvoices = invoices.filter((inv) => {
        return inv.status === 'partially_paid' && !isOverdue(inv);
      });

      // Paid: status='paid'
      const paidInvoices = invoices.filter((inv) => inv.status === 'paid');

      // Calculate totals
      const sumAmount = (list: { total_amount: number }[]) =>
        list.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      return {
        total,
        pendingPayments: overdueInvoices.length + unpaidInvoices.length, // Legacy field
        overdue: {
          count: overdueInvoices.length,
          totalAmount: sumAmount(overdueInvoices),
        },
        unpaid: {
          count: unpaidInvoices.length,
          totalAmount: sumAmount(unpaidInvoices),
        },
        partiallyPaid: {
          count: partiallyPaidInvoices.length,
          totalAmount: sumAmount(partiallyPaidInvoices),
        },
        paid: {
          count: paidInvoices.length,
          totalAmount: sumAmount(paidInvoices),
        },
      };
    },
    enabled: !!weddingId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
