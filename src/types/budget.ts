/**
 * Budget Tracking TypeScript Types
 * @feature 011-budget-tracking
 */

// =============================================================================
// Database Entity Types
// =============================================================================

/**
 * Budget status enumeration for display
 */
export type BudgetStatusLabel = 'On Track' | '90% Spent' | 'Over Budget';

/**
 * Database entity - mirrors Supabase budget_categories table
 */
export interface BudgetCategory {
  id: string;
  wedding_id: string;
  category_name: string;
  projected_amount: number;
  actual_amount: number;
  variance: number; // Generated column: actual_amount - projected_amount
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Form Types
// =============================================================================

/**
 * Form data for create/edit budget category modal
 */
export interface BudgetCategoryFormData {
  category_name: string;
  projected_amount: number;
  actual_amount: number;
  notes?: string;
}

/**
 * Default form values for new budget category
 */
export const DEFAULT_BUDGET_CATEGORY_FORM: BudgetCategoryFormData = {
  category_name: '',
  projected_amount: 0,
  actual_amount: 0,
  notes: '',
};

// =============================================================================
// Display Types
// =============================================================================

/**
 * Budget status badge configuration
 */
export interface BudgetStatusBadge {
  label: string;
  status: 'on-track' | 'warning' | 'over-budget';
  color: string;
  bgColor: string;
}

/**
 * Budget overview statistics for stat cards
 */
export interface BudgetOverview {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentSpent: number;
}

/**
 * Extended budget category with computed display properties
 */
export interface BudgetCategoryDisplay extends BudgetCategory {
  statusBadge: BudgetStatusBadge;
  percentUsed: number;
}

// =============================================================================
// Pie Chart Types
// =============================================================================

/**
 * Data shape for recharts pie chart
 */
export interface BudgetPieChartData {
  name: string;
  value: number;
  percentage: number;
}

// =============================================================================
// Display Configuration
// =============================================================================

/**
 * Status badge configuration based on spending thresholds
 */
export const BUDGET_STATUS_CONFIG = {
  'on-track': {
    label: 'On Track',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  warning: {
    label: '90% Spent',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  'over-budget': {
    label: 'Over Budget',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
} as const;

/**
 * Color palette for pie chart slices (12 colors)
 */
export const CHART_COLORS = [
  '#D4A5A5', // Brand primary (dusty rose)
  '#A8B8A6', // Brand secondary (sage green)
  '#C9A961', // Accent gold
  '#E8B4B8', // Event 1
  '#C9D4C5', // Event 3
  '#E5D4EF', // Event 4
  '#FFE5CC', // Event 5
  '#D4E5F7', // Event 6
  '#F7D4E5', // Event 7
  '#B8D4E8', // Light blue
  '#E8D4B8', // Light tan
  '#D4E8D4', // Light green
] as const;
