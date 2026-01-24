/**
 * Budget Categories API Contract
 * @feature 029-budget-vendor-integration
 *
 * Defines the interface for budget category operations with category type integration.
 */

import { BudgetCategoryType, BudgetCategoryTypeRow } from './budget-category-types';

// =============================================================================
// Types
// =============================================================================

export interface BudgetCategory {
  id: string;
  weddingId: string;
  name: string;
  categoryTypeId: string | null;
  customName: string | null;
  projectedAmount: number;
  actualAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// With joined category type
export interface BudgetCategoryWithType extends BudgetCategory {
  categoryType: BudgetCategoryType | null;
}

// Database row format
export interface BudgetCategoryRow {
  id: string;
  wedding_id: string;
  name: string;
  category_type_id: string | null;
  custom_name: string | null;
  projected_amount: number;
  actual_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// With joined type
export interface BudgetCategoryRowWithType extends BudgetCategoryRow {
  category_type: BudgetCategoryTypeRow | null;
}

// Computed display values
export interface BudgetCategoryDisplay extends BudgetCategoryWithType {
  invoicedUnpaid: number;
  totalCommitted: number;
  remaining: number;
  percentageSpent: number;
  isNearLimit: boolean;
  isOverBudget: boolean;
}

// =============================================================================
// Transformers
// =============================================================================

import { transformBudgetCategoryType } from './budget-category-types';

export function transformBudgetCategory(row: BudgetCategoryRow): BudgetCategory {
  return {
    id: row.id,
    weddingId: row.wedding_id,
    name: row.name,
    categoryTypeId: row.category_type_id,
    customName: row.custom_name,
    projectedAmount: row.projected_amount ?? 0,
    actualAmount: row.actual_amount ?? 0,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function transformBudgetCategoryWithType(
  row: BudgetCategoryRowWithType
): BudgetCategoryWithType {
  return {
    ...transformBudgetCategory(row),
    categoryType: row.category_type ? transformBudgetCategoryType(row.category_type) : null,
  };
}

// =============================================================================
// Display Calculations
// =============================================================================

/**
 * Calculate display values for budget category
 */
export function calculateBudgetCategoryDisplay(
  category: BudgetCategoryWithType
): BudgetCategoryDisplay {
  const projected = category.projectedAmount || 0;
  const actual = category.actualAmount || 0;
  const invoicedUnpaid = Math.max(0, projected - actual);
  const totalCommitted = actual + invoicedUnpaid;
  const remaining = Math.max(0, projected - totalCommitted);
  const percentageSpent = projected > 0 ? (actual / projected) * 100 : 0;

  return {
    ...category,
    invoicedUnpaid,
    totalCommitted,
    remaining,
    percentageSpent,
    isNearLimit: percentageSpent >= 90 && percentageSpent < 100,
    isOverBudget: actual > projected,
  };
}

// =============================================================================
// Query Contracts
// =============================================================================

/**
 * Fetch budget categories for a wedding with category types
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('budget_categories')
 *   .select(`
 *     *,
 *     category_type:budget_category_types(*)
 *   `)
 *   .eq('wedding_id', weddingId)
 *   .order('category_type(display_order)');
 *
 * if (error) throw error;
 * return data.map(transformBudgetCategoryWithType);
 * ```
 */
export interface FetchBudgetCategoriesContract {
  input: { weddingId: string };
  output: BudgetCategoryWithType[];
  error: Error;
}

// =============================================================================
// Mutation Contracts
// =============================================================================

export interface CreateBudgetCategoryInput {
  weddingId: string;
  name: string;
  categoryTypeId: string;
  customName?: string | null;
  projectedAmount?: number;
  notes?: string | null;
}

/**
 * Create a new budget category
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('budget_categories')
 *   .insert({
 *     wedding_id: input.weddingId,
 *     name: input.name,
 *     category_type_id: input.categoryTypeId,
 *     custom_name: input.customName,
 *     projected_amount: input.projectedAmount ?? 0,
 *     actual_amount: 0,
 *     notes: input.notes,
 *   })
 *   .select(`*, category_type:budget_category_types(*)`)
 *   .single();
 * ```
 */
export interface CreateBudgetCategoryContract {
  input: CreateBudgetCategoryInput;
  output: BudgetCategoryWithType;
  error: Error;
}

export interface UpdateBudgetCategoryInput {
  categoryId: string;
  name?: string;
  categoryTypeId?: string;
  customName?: string | null;
  projectedAmount?: number;
  notes?: string | null;
}

/**
 * Update a budget category
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('budget_categories')
 *   .update({
 *     name: input.name,
 *     category_type_id: input.categoryTypeId,
 *     custom_name: input.customName,
 *     projected_amount: input.projectedAmount,
 *     notes: input.notes,
 *   })
 *   .eq('id', input.categoryId)
 *   .select(`*, category_type:budget_category_types(*)`)
 *   .single();
 * ```
 */
export interface UpdateBudgetCategoryContract {
  input: UpdateBudgetCategoryInput;
  output: BudgetCategoryWithType;
  error: Error;
}

// =============================================================================
// Validation
// =============================================================================

import { z } from 'zod';

export const budgetCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryTypeId: z.string().uuid('Invalid category type'),
  customName: z.string().optional().nullable(),
  projectedAmount: z.number().min(0, 'Amount must be positive').optional(),
  notes: z.string().optional().nullable(),
});

/**
 * Validate that custom name is provided for "Other/Custom" type
 */
export function validateCustomName(
  categoryTypeId: string,
  customName: string | null | undefined,
  isOtherCustom: (typeId: string) => boolean
): string | null {
  if (isOtherCustom(categoryTypeId)) {
    if (!customName || customName.trim() === '') {
      return 'Custom name is required for "Other/Custom" category type';
    }
  }
  return null;
}
