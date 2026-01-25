/**
 * Budget Calculation Utilities
 * @feature 029-budget-vendor-integration
 *
 * Provides calculation functions for budget tracking and display.
 */

import type {
  BudgetCategoryWithType,
  BudgetCategoryEnhancedDisplay,
  BudgetStatusBadge,
  PaymentStatus,
} from '@/types/budget';
import { BUDGET_STATUS_CONFIG } from '@/types/budget';

// =============================================================================
// Currency Formatting
// =============================================================================

/**
 * Format currency in South African Rand (ZAR)
 * @param amount - The amount to format
 * @returns Formatted string like "R 1,234.56"
 */
export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format currency without the R symbol
 * @param amount - The amount to format
 * @returns Formatted string like "1,234.56"
 */
export function formatCurrencyAmount(amount: number): string {
  return amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// =============================================================================
// VAT Calculations
// =============================================================================

/** VAT rate in South Africa (15%) */
export const VAT_RATE = 0.15;

/**
 * Calculate VAT amount at 15%
 * @param amount - The base amount before VAT
 * @returns VAT amount
 */
export function calculateVAT(amount: number): number {
  return amount * VAT_RATE;
}

/**
 * Calculate total including VAT
 * @param amount - The base amount
 * @param vatAmount - The VAT amount
 * @returns Total amount (base + VAT)
 */
export function calculateTotal(amount: number, vatAmount: number): number {
  return amount + vatAmount;
}

/**
 * Calculate invoice total from base amount
 * @param amount - The base amount before VAT
 * @returns Total including VAT
 */
export function calculateInvoiceTotal(amount: number): number {
  return amount + calculateVAT(amount);
}

// =============================================================================
// Payment Status
// =============================================================================

/**
 * Determine payment status based on amounts paid vs total
 * @param totalPaid - Amount already paid
 * @param invoiceTotal - Total invoice amount
 * @returns Payment status
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

/**
 * Calculate remaining balance on an invoice
 * @param invoiceTotal - Total invoice amount
 * @param totalPaid - Amount already paid
 * @returns Remaining balance (minimum 0)
 */
export function calculateRemainingBalance(
  invoiceTotal: number,
  totalPaid: number
): number {
  return Math.max(0, invoiceTotal - totalPaid);
}

/**
 * Validate payment amount doesn't exceed remaining balance
 * @param paymentAmount - Proposed payment amount
 * @param invoiceTotal - Total invoice amount
 * @param alreadyPaid - Amount already paid
 * @returns Error message if invalid, null if valid
 */
export function validatePaymentAmount(
  paymentAmount: number,
  invoiceTotal: number,
  alreadyPaid: number
): string | null {
  const remaining = calculateRemainingBalance(invoiceTotal, alreadyPaid);
  if (paymentAmount > remaining) {
    return `Payment amount (${formatCurrency(paymentAmount)}) exceeds remaining balance (${formatCurrency(remaining)})`;
  }
  return null;
}

// =============================================================================
// Budget Category Display Calculations
// =============================================================================

/**
 * Calculate budget warning level based on percentage spent
 * @param percentageSpent - Percentage of budget spent
 * @returns Warning level for styling
 */
export function getBudgetWarningLevel(
  percentageSpent: number
): 'on-track' | 'near-budget' | 'at-budget' | 'over-budget' {
  if (percentageSpent > 100) return 'over-budget';
  if (percentageSpent >= 99.99) return 'at-budget'; // Account for floating point precision
  if (percentageSpent >= 90) return 'near-budget';
  return 'on-track';
}

/**
 * Get status badge configuration for budget category
 * @param percentageSpent - Percentage of budget spent
 * @returns Badge configuration with label, color, bgColor
 */
export function getBudgetStatusBadge(percentageSpent: number): BudgetStatusBadge {
  const level = getBudgetWarningLevel(percentageSpent);
  const config = BUDGET_STATUS_CONFIG[level];
  return {
    label: config.label,
    status: level,
    color: config.color,
    bgColor: config.bgColor,
  };
}

/**
 * Calculate display values for a budget category
 * T009: Enhanced category display with computed financial fields
 *
 * @param category - Budget category with type data
 * @returns Enhanced display object with computed values
 */
export function calculateBudgetCategoryDisplay(
  category: BudgetCategoryWithType
): BudgetCategoryEnhancedDisplay {
  const projected = category.projected_amount || 0;
  const actual = category.actual_amount || 0;

  // Invoiced unpaid = projected - actual (amount committed but not yet paid)
  const invoicedUnpaid = Math.max(0, projected - actual);

  // Total committed = actual + invoiced unpaid (should equal projected)
  const totalCommitted = actual + invoicedUnpaid;

  // Remaining = projected - total committed (should be 0 if fully invoiced)
  const remaining = Math.max(0, projected - totalCommitted);

  // Percentage spent = actual / projected * 100
  const percentageSpent = projected > 0 ? (actual / projected) * 100 : 0;

  // Warning thresholds
  const isNearLimit = percentageSpent >= 90 && percentageSpent < 100;
  const isOverBudget = actual > projected;

  // Status badge
  const statusBadge = getBudgetStatusBadge(percentageSpent);

  return {
    ...category,
    invoicedUnpaid,
    totalCommitted,
    remaining,
    percentageSpent,
    isNearLimit,
    isOverBudget,
    statusBadge,
  };
}

/**
 * Format percentage for display
 * @param value - Percentage value
 * @returns Formatted string like "85.0%"
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// =============================================================================
// Budget Impact Preview
// =============================================================================

/**
 * Budget impact preview for payment recording
 */
export interface BudgetImpactPreview {
  categoryId: string;
  categoryName: string;
  currentActual: number;
  newActual: number;
  changeAmount: number;
  newPercentageSpent: number;
  willTriggerWarning: boolean;
  willExceedBudget: boolean;
}

/**
 * Calculate budget impact preview before recording a payment
 * @param category - Budget category with type data
 * @param paymentAmount - Amount of payment being recorded
 * @returns Impact preview showing before/after values
 */
export function calculateBudgetImpactPreview(
  category: BudgetCategoryWithType,
  paymentAmount: number
): BudgetImpactPreview {
  const currentActual = category.actual_amount || 0;
  const newActual = currentActual + paymentAmount;
  const projected = category.projected_amount || 0;
  const newPercentageSpent = projected > 0 ? (newActual / projected) * 100 : 0;

  return {
    categoryId: category.id,
    categoryName: category.category_name,
    currentActual,
    newActual,
    changeAmount: paymentAmount,
    newPercentageSpent,
    willTriggerWarning: newPercentageSpent >= 90 && newPercentageSpent < 100,
    willExceedBudget: newActual > projected,
  };
}
