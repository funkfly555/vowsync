/**
 * Budget Category Types API Contract
 * @feature 029-budget-vendor-integration
 *
 * Defines the interface for budget category type operations.
 * This is a read-only lookup table with 18 predefined wedding category types.
 */

// =============================================================================
// Types
// =============================================================================

export interface BudgetCategoryType {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Database row format (snake_case for Supabase)
export interface BudgetCategoryTypeRow {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Predefined category type names
export type BudgetCategoryTypeName =
  | 'Venue'
  | 'Catering'
  | 'Photography'
  | 'Videography'
  | 'Flowers & Florist'
  | 'Music/DJ/Band'
  | 'Cake & Desserts'
  | 'Stationery & Invitations'
  | 'Hair & Makeup'
  | 'Transportation'
  | 'Accommodation'
  | 'Decor & Styling'
  | 'Rentals & Equipment'
  | 'Wedding Planner/Coordinator'
  | 'Attire'
  | 'Rings'
  | 'Favors & Gifts'
  | 'Other/Custom';

// =============================================================================
// Transformers
// =============================================================================

/**
 * Transform database row to application type
 */
export function transformBudgetCategoryType(row: BudgetCategoryTypeRow): BudgetCategoryType {
  return {
    id: row.id,
    name: row.name,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// =============================================================================
// Query Contract
// =============================================================================

/**
 * Fetch all budget category types
 *
 * @returns BudgetCategoryType[] sorted by display_order
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('budget_category_types')
 *   .select('*')
 *   .order('display_order');
 *
 * if (error) throw error;
 * return data.map(transformBudgetCategoryType);
 * ```
 */
export interface FetchBudgetCategoryTypesContract {
  input: void;
  output: BudgetCategoryType[];
  error: Error;
}

/**
 * Fetch single budget category type by ID
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('budget_category_types')
 *   .select('*')
 *   .eq('id', typeId)
 *   .single();
 * ```
 */
export interface FetchBudgetCategoryTypeContract {
  input: { typeId: string };
  output: BudgetCategoryType | null;
  error: Error;
}

/**
 * Check if a type is "Other/Custom"
 */
export function isOtherCustomType(type: BudgetCategoryType): boolean {
  return type.name === 'Other/Custom';
}

/**
 * Check if a type ID is "Other/Custom"
 */
export function isOtherCustomTypeId(typeId: string, types: BudgetCategoryType[]): boolean {
  const type = types.find((t) => t.id === typeId);
  return type ? isOtherCustomType(type) : false;
}
