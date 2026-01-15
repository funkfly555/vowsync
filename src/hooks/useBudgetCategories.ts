/**
 * useBudgetCategories Hook - TanStack Query hooks for budget category data
 * @feature 011-budget-tracking
 * T005: Fetch budget categories for a wedding
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BudgetCategory } from '@/types/budget';

// =============================================================================
// Fetch All Budget Categories for Wedding
// =============================================================================

interface UseBudgetCategoriesReturn {
  categories: BudgetCategory[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchBudgetCategories(weddingId: string): Promise<BudgetCategory[]> {
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('category_name', { ascending: true });

  if (error) {
    console.error('Error fetching budget categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * Hook to fetch all budget categories for a wedding
 * Sorted by category_name ascending (alphabetical)
 */
export function useBudgetCategories(weddingId: string | undefined): UseBudgetCategoriesReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['budget-categories', weddingId],
    queryFn: () => fetchBudgetCategories(weddingId!),
    enabled: !!weddingId,
  });

  return {
    categories: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Fetch Single Budget Category
// =============================================================================

interface UseBudgetCategoryReturn {
  category: BudgetCategory | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

async function fetchBudgetCategory(categoryId: string): Promise<BudgetCategory | null> {
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (error) {
    console.error('Error fetching budget category:', error);
    throw error;
  }

  return data;
}

/**
 * Hook to fetch a single budget category by ID
 */
export function useBudgetCategory(categoryId: string | undefined): UseBudgetCategoryReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['budget-category', categoryId],
    queryFn: () => fetchBudgetCategory(categoryId!),
    enabled: !!categoryId,
  });

  return {
    category: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
