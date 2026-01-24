/**
 * useBudgetCategoryTypes Hook - TanStack Query hook for budget category types
 * @feature 029-budget-vendor-integration
 * T012: Fetch predefined budget category types
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BudgetCategoryType, BudgetCategoryTypeRow } from '@/types/budget';
import { transformBudgetCategoryType } from '@/types/budget';

// =============================================================================
// Query Key
// =============================================================================

export const budgetCategoryTypesQueryKey = ['budget-category-types'] as const;

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchBudgetCategoryTypes(): Promise<BudgetCategoryType[]> {
  const { data, error } = await supabase
    .from('budget_category_types')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching budget category types:', error);
    throw error;
  }

  return (data as BudgetCategoryTypeRow[]).map(transformBudgetCategoryType);
}

// =============================================================================
// Hook
// =============================================================================

interface UseBudgetCategoryTypesReturn {
  categoryTypes: BudgetCategoryType[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch all predefined budget category types
 * Sorted by display_order ascending
 *
 * Note: staleTime is set to Infinity since these rarely change
 */
export function useBudgetCategoryTypes(): UseBudgetCategoryTypesReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: budgetCategoryTypesQueryKey,
    queryFn: fetchBudgetCategoryTypes,
    staleTime: Infinity, // Category types rarely change
    gcTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  return {
    categoryTypes: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Find the "Other/Custom" category type ID
 * @param types - Array of budget category types
 * @returns ID of the "Other/Custom" type, or null if not found
 */
export function findOtherCustomTypeId(types: BudgetCategoryType[]): string | null {
  const otherType = types.find((t) => t.name === 'Other/Custom');
  return otherType?.id || null;
}

/**
 * Check if a category type ID is the "Other/Custom" type
 * @param typeId - Category type ID to check
 * @param types - Array of budget category types
 * @returns True if the type is "Other/Custom"
 */
export function isOtherCustomType(
  typeId: string | null,
  types: BudgetCategoryType[]
): boolean {
  if (!typeId) return false;
  const type = types.find((t) => t.id === typeId);
  return type?.name === 'Other/Custom';
}
