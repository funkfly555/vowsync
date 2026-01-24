/**
 * Budget Tracking TypeScript Types
 * @feature 011-budget-tracking
 * @feature 029-budget-vendor-integration
 */

// =============================================================================
// Budget Category Types (Feature 029)
// =============================================================================

/**
 * Budget category type - predefined wedding budget categories
 * T007: BudgetCategoryType interface
 */
export interface BudgetCategoryType {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Database row format for budget_category_types (snake_case)
 */
export interface BudgetCategoryTypeRow {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Transform database row to camelCase interface
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
// Payment Status Types (Feature 029)
// =============================================================================

/**
 * T008: Payment status for budget line items
 */
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

/**
 * Determine payment status based on amounts paid vs total
 */
export function determinePaymentStatus(
  totalPaid: number,
  invoiceTotal: number
): PaymentStatus {
  if (totalPaid >= invoiceTotal) {
    return 'paid';
  }
  if (totalPaid > 0) {
    return 'partially_paid';
  }
  return 'unpaid';
}

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
  category_type_id: string | null; // Feature 029
  custom_name: string | null; // Feature 029
  projected_amount: number;
  actual_amount: number;
  variance: number; // Generated column: actual_amount - projected_amount
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Budget category with joined category type data
 * Feature 029
 */
export interface BudgetCategoryWithType extends BudgetCategory {
  category_type: BudgetCategoryType | null;
}

// =============================================================================
// Budget Line Item Types (Feature 029)
// =============================================================================

/**
 * T008: Database entity - mirrors Supabase budget_line_items table
 * Updated for vendor invoice integration
 */
export interface BudgetLineItem {
  id: string;
  budget_category_id: string;
  vendor_id: string | null;
  vendor_invoice_id: string | null;
  item_description: string;
  projected_cost: number;
  actual_cost: number;
  variance: number;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Budget line item with joined vendor invoice data
 */
export interface BudgetLineItemWithInvoice extends BudgetLineItem {
  vendor_invoice?: {
    id: string;
    invoice_number: string;
    amount: number;
    vat_amount: number;
  } | null;
}

// =============================================================================
// Form Types
// =============================================================================

/**
 * Form data for create/edit budget category modal
 * Updated for Feature 029: Budget-Vendor Integration
 */
export interface BudgetCategoryFormData {
  category_name: string;
  projected_amount: number;
  actual_amount: number;
  notes?: string;
  // Feature 029: Category type fields
  category_type_id?: string;
  custom_name?: string | null;
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

/**
 * T009: Enhanced budget category display with computed financial fields
 * Feature 029: Budget-Vendor Integration
 */
export interface BudgetCategoryEnhancedDisplay extends BudgetCategoryWithType {
  /** Amount invoiced but not yet paid (projected - actual) */
  invoicedUnpaid: number;
  /** Total committed = actual + invoicedUnpaid = projected */
  totalCommitted: number;
  /** Remaining budget (projected - totalCommitted) */
  remaining: number;
  /** Percentage of budget spent (actual / projected * 100) */
  percentageSpent: number;
  /** True if spending is >= 90% but < 100% */
  isNearLimit: boolean;
  /** True if actual > projected (over budget) */
  isOverBudget: boolean;
  /** Status badge for display */
  statusBadge: BudgetStatusBadge;
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
