/**
 * Budget Status Calculation Utilities
 * @feature 011-budget-tracking
 * T004: Status helpers and currency formatter
 */

import type {
  BudgetCategory,
  BudgetStatusBadge,
  BudgetOverview,
  BudgetCategoryDisplay,
  BudgetPieChartData,
} from '@/types/budget';

// =============================================================================
// Currency Formatting
// =============================================================================

/**
 * Format currency in South African Rand (R X,XXX.XX)
 * FR-015: Consistent currency formatting across all components
 */
export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format currency without the R prefix (for inputs)
 */
export function formatCurrencyValue(amount: number): string {
  return amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// =============================================================================
// Status Calculation
// =============================================================================

/**
 * Calculate budget status badge based on actual/projected ratio
 * FR-008: Status thresholds
 * - On Track: actual < 90% of projected (green)
 * - Near Budget: actual >= 90% AND actual < 100% of projected (orange)
 * - At Budget: actual = 100% of projected (orange)
 * - Over Budget: actual > projected (red, with overAmount for formatted display)
 *
 * Edge case: When projected = 0, always show "On Track"
 */
export function calculateBudgetStatus(
  projectedAmount: number,
  actualAmount: number
): BudgetStatusBadge {
  // Edge case: projected = 0 shows "On Track" (avoid division by zero)
  if (projectedAmount === 0) {
    return {
      label: 'On Track',
      status: 'on-track',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    };
  }

  const percentUsed = (actualAmount / projectedAmount) * 100;
  const overAmount = actualAmount - projectedAmount;

  // Over Budget: actual > projected
  if (actualAmount > projectedAmount) {
    return {
      label: 'Over Budget',
      status: 'over-budget',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      overAmount, // Component will format this with user's currency
    };
  }

  // At Budget: actual = 100% of projected (within small tolerance for floating point)
  if (percentUsed >= 99.99) {
    return {
      label: 'At Budget',
      status: 'at-budget',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
    };
  }

  // Near Budget: actual >= 90% of projected
  if (percentUsed >= 90) {
    return {
      label: 'Near Budget',
      status: 'near-budget',
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
    };
  }

  // On Track: actual < 90% of projected
  return {
    label: 'On Track',
    status: 'on-track',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  };
}

/**
 * Calculate percentage used (capped at 100+ for display)
 */
export function calculatePercentUsed(
  projectedAmount: number,
  actualAmount: number
): number {
  if (projectedAmount === 0) return 0;
  return Math.round((actualAmount / projectedAmount) * 100);
}

// =============================================================================
// Overview Calculations
// =============================================================================

/**
 * Calculate budget overview statistics from categories
 * FR-002: 4 summary stat cards
 */
export function calculateBudgetOverview(categories: BudgetCategory[]): BudgetOverview {
  const totalBudget = categories.reduce((sum, c) => sum + (c.projected_amount || 0), 0);
  const totalSpent = categories.reduce((sum, c) => sum + (c.actual_amount || 0), 0);
  const remaining = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    totalBudget,
    totalSpent,
    remaining,
    percentSpent,
  };
}

/**
 * Get progress bar status color based on percentage
 * FR-003: Color-coded progress bar
 */
export function getProgressBarStatus(percentSpent: number): {
  color: string;
  bgColor: string;
  status: 'normal' | 'warning' | 'danger';
} {
  if (percentSpent >= 100) {
    return {
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      status: 'danger',
    };
  }
  if (percentSpent >= 90) {
    return {
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      status: 'warning',
    };
  }
  return {
    color: 'bg-green-500',
    bgColor: 'bg-gray-200',
    status: 'normal',
  };
}

// =============================================================================
// Display Transformations
// =============================================================================

/**
 * Transform budget category to display format with computed properties
 */
export function toBudgetCategoryDisplay(category: BudgetCategory): BudgetCategoryDisplay {
  return {
    ...category,
    statusBadge: calculateBudgetStatus(category.projected_amount, category.actual_amount),
    percentUsed: calculatePercentUsed(category.projected_amount, category.actual_amount),
  };
}

/**
 * Transform categories to pie chart data
 * Uses projected_amount for allocation visualization
 */
export function toBudgetPieChartData(categories: BudgetCategory[]): BudgetPieChartData[] {
  const totalBudget = categories.reduce((sum, c) => sum + (c.projected_amount || 0), 0);

  if (totalBudget === 0) return [];

  return categories
    .filter(c => c.projected_amount > 0)
    .map(category => ({
      name: category.category_name,
      value: category.projected_amount,
      percentage: Math.round((category.projected_amount / totalBudget) * 100),
    }));
}

// =============================================================================
// Variance Formatting
// =============================================================================

/**
 * Format variance for display
 * Positive = over budget, Negative = under budget
 */
export function formatVariance(variance: number): string {
  if (variance === 0) return formatCurrency(0);
  const prefix = variance > 0 ? '+' : '';
  return `${prefix}${formatCurrency(variance)}`;
}

/**
 * Get variance color class
 */
export function getVarianceColor(variance: number): string {
  if (variance > 0) return 'text-red-600'; // Over budget
  if (variance < 0) return 'text-green-600'; // Under budget
  return 'text-gray-600'; // On budget
}
