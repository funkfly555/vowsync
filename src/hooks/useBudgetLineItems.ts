/**
 * useBudgetLineItems Hook - TanStack Query hooks for budget line items
 * @feature 029-budget-vendor-integration
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BudgetLineItem } from '@/types/budget';

// =============================================================================
// Query Keys
// =============================================================================

export const budgetLineItemsQueryKey = (categoryId: string) =>
  ['budget-line-items', categoryId] as const;

export const budgetLineItemByInvoiceQueryKey = (invoiceId: string) =>
  ['budget-line-item-by-invoice', invoiceId] as const;

// =============================================================================
// Fetch Budget Line Items for Category
// =============================================================================

interface UseBudgetLineItemsReturn {
  lineItems: BudgetLineItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchBudgetLineItems(categoryId: string): Promise<BudgetLineItem[]> {
  const { data, error } = await supabase
    .from('budget_line_items')
    .select('*')
    .eq('budget_category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budget line items:', error);
    throw error;
  }

  return data || [];
}

/**
 * Hook to fetch all budget line items for a category
 */
export function useBudgetLineItems(categoryId: string | undefined): UseBudgetLineItemsReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: budgetLineItemsQueryKey(categoryId || ''),
    queryFn: () => fetchBudgetLineItems(categoryId!),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    lineItems: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Fetch Budget Line Item by Invoice ID
// =============================================================================

interface UseBudgetLineItemByInvoiceReturn {
  lineItem: BudgetLineItem | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

async function fetchBudgetLineItemByInvoice(invoiceId: string): Promise<BudgetLineItem | null> {
  const { data, error } = await supabase
    .from('budget_line_items')
    .select('*')
    .eq('vendor_invoice_id', invoiceId)
    .single();

  if (error) {
    // PGRST116 = No rows returned - not an error for our use case
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching budget line item by invoice:', error);
    throw error;
  }

  return data;
}

/**
 * Hook to fetch budget line item by vendor invoice ID
 * Returns null if no line item exists for the invoice
 */
export function useBudgetLineItemByInvoice(
  invoiceId: string | undefined
): UseBudgetLineItemByInvoiceReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: budgetLineItemByInvoiceQueryKey(invoiceId || ''),
    queryFn: () => fetchBudgetLineItemByInvoice(invoiceId!),
    enabled: !!invoiceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    lineItem: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
