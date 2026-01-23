/**
 * useVendorTableData Hook - Data fetching for Vendor Table View
 * @feature 027-vendor-view-toggle
 *
 * Fetches vendors with computed aggregate counts for related records
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  applyVendorFilters,
  applyColumnFilters,
  transformToTableRows,
  countByVendorId,
} from '@/lib/vendor-table-utils';
import { VENDOR_TABLE_COLUMNS } from '@/components/vendors/table/tableColumns';
import type {
  VendorTableRow,
  VendorCellEditPayload,
  UseVendorTableDataParams,
  UseVendorTableDataReturn,
} from '@/types/vendor-table';
import type { Vendor } from '@/types/vendor';
import { toast } from 'sonner';

/**
 * Fetches and transforms vendor data for the Table View
 * Includes aggregate counts from related tables
 */
export function useVendorTableData({
  weddingId,
  filters,
  columnFilters = [],
  enabled = true,
}: UseVendorTableDataParams): UseVendorTableDataReturn {
  const query = useQuery({
    queryKey: ['vendor-table-data', weddingId],
    queryFn: async (): Promise<VendorTableRow[]> => {
      // First fetch vendors for this wedding
      const vendorsResult = await supabase
        .from('vendors')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('company_name', { ascending: true });

      if (vendorsResult.error) throw vendorsResult.error;

      const vendors = (vendorsResult.data as Vendor[]) || [];
      const vendorIds = vendors.map((v) => v.id);

      // If no vendors, return empty array (skip aggregate queries)
      if (vendorIds.length === 0) {
        return [];
      }

      // Parallel fetch for aggregate counts using vendor_ids
      const [contactsResult, paymentsResult, invoicesResult] =
        await Promise.all([
          // Contacts count per vendor (via vendor_id, not wedding_id)
          supabase
            .from('vendor_contacts')
            .select('vendor_id')
            .in('vendor_id', vendorIds),

          // Payments count per vendor
          supabase
            .from('vendor_payment_schedule')
            .select('vendor_id')
            .in('vendor_id', vendorIds),

          // Invoices count per vendor
          supabase
            .from('vendor_invoices')
            .select('vendor_id')
            .in('vendor_id', vendorIds),
        ]);

      // Error handling for aggregate queries
      if (contactsResult.error) throw contactsResult.error;
      if (paymentsResult.error) throw paymentsResult.error;
      if (invoicesResult.error) throw invoicesResult.error;

      // Count aggregates
      const contactsCounts = countByVendorId(contactsResult.data);
      const paymentsCounts = countByVendorId(paymentsResult.data);
      const invoicesCounts = countByVendorId(invoicesResult.data);

      // Transform to table rows
      return transformToTableRows(
        vendors,
        contactsCounts,
        paymentsCounts,
        invoicesCounts
      );
    },
    enabled: enabled && !!weddingId,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
  });

  // Extract data for memoization
  const queryRows = query.data;

  // Apply shared vendor filters (for filter dropdowns to show all possible values)
  const rowsAfterVendorFilters = useMemo(() => {
    if (!queryRows) return [];
    return applyVendorFilters(queryRows, filters);
  }, [queryRows, filters]);

  // Apply column-specific filters on top of vendor filters (for display)
  const filteredRows = useMemo(() => {
    if (columnFilters.length === 0) return rowsAfterVendorFilters;
    return applyColumnFilters(rowsAfterVendorFilters, columnFilters);
  }, [rowsAfterVendorFilters, columnFilters]);

  return {
    rows: filteredRows,
    columns: VENDOR_TABLE_COLUMNS,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Mutation hook for updating individual vendor cells
 * Includes optimistic updates and rollback on error
 */
export function useUpdateVendorCell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VendorCellEditPayload) => {
      const { error } = await supabase
        .from('vendors')
        .update({
          [payload.field]: payload.value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.vendorId)
        .eq('wedding_id', payload.weddingId);

      if (error) throw error;

      return payload;
    },

    // Optimistic update
    onMutate: async (payload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['vendor-table-data', payload.weddingId],
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<VendorTableRow[]>([
        'vendor-table-data',
        payload.weddingId,
      ]);

      // Optimistically update cache
      queryClient.setQueryData<VendorTableRow[]>(
        ['vendor-table-data', payload.weddingId],
        (old) =>
          old?.map((row) =>
            row.id === payload.vendorId
              ? { ...row, [payload.field]: payload.value }
              : row
          )
      );

      return { previousData };
    },

    // Rollback on error
    onError: (err, payload, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['vendor-table-data', payload.weddingId],
          context.previousData
        );
      }
      toast.error('Failed to save changes');
      console.error('Vendor cell update error:', err);
    },

    // Refetch on success
    onSettled: (_, __, payload) => {
      // Invalidate vendor table data
      queryClient.invalidateQueries({
        queryKey: ['vendor-table-data', payload.weddingId],
      });
      // Also invalidate vendors list for Card View consistency
      queryClient.invalidateQueries({
        queryKey: ['vendors', payload.weddingId],
      });
    },
  });
}
