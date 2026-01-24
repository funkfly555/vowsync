/**
 * useBudgetCategories Hook - TanStack Query hooks for budget category data
 * @feature 011-budget-tracking
 * @feature 029-budget-vendor-integration
 * T005: Fetch budget categories for a wedding
 * T013: Include category_type joins
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  BudgetCategory,
  BudgetCategoryWithType,
  BudgetCategoryTypeRow,
} from '@/types/budget';
import { transformBudgetCategoryType } from '@/types/budget';

// =============================================================================
// Query Keys
// =============================================================================

export const budgetCategoriesQueryKey = (weddingId: string) =>
  ['budget-categories', weddingId] as const;

// =============================================================================
// Fetch All Budget Categories for Wedding (Basic)
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
    queryKey: budgetCategoriesQueryKey(weddingId || ''),
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
// Fetch Budget Categories with Type Joins (Feature 029)
// =============================================================================

interface UseBudgetCategoriesWithTypesReturn {
  categories: BudgetCategoryWithType[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Database response type with joined category_type data
 */
interface BudgetCategoryRowWithType extends BudgetCategory {
  category_type: BudgetCategoryTypeRow | null;
}

/**
 * Transform database row to camelCase interface with nested type
 */
function transformBudgetCategoryWithType(
  row: BudgetCategoryRowWithType
): BudgetCategoryWithType {
  return {
    ...row,
    category_type: row.category_type
      ? transformBudgetCategoryType(row.category_type)
      : null,
  };
}

async function fetchBudgetCategoriesWithTypes(
  weddingId: string
): Promise<BudgetCategoryWithType[]> {
  const { data, error } = await supabase
    .from('budget_categories')
    .select(
      `
      *,
      category_type:budget_category_types(*)
    `
    )
    .eq('wedding_id', weddingId);

  if (error) {
    console.error('Error fetching budget categories with types:', error);
    throw error;
  }

  // T035: Sort by category_type.display_order, then by category_name
  const transformed = (data as BudgetCategoryRowWithType[]).map(transformBudgetCategoryWithType);
  return transformed.sort((a, b) => {
    // Categories with types come first, sorted by display_order
    const orderA = a.category_type?.displayOrder ?? 999;
    const orderB = b.category_type?.displayOrder ?? 999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Within same display order, sort alphabetically
    return a.category_name.localeCompare(b.category_name);
  });
}

/**
 * T013: Hook to fetch all budget categories for a wedding with category type joins
 * T035: Sorted by category_type.display_order, then by category_name
 * Includes joined category_type data for display
 */
export function useBudgetCategoriesWithTypes(
  weddingId: string | undefined
): UseBudgetCategoriesWithTypesReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...budgetCategoriesQueryKey(weddingId || ''), 'with-types'],
    queryFn: () => fetchBudgetCategoriesWithTypes(weddingId!),
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
