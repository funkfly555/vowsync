/**
 * Bar Order Calculation Helpers
 * @feature 012-bar-order-management
 *
 * Client-side calculations for preview. Database uses GENERATED columns
 * as the source of truth.
 */

import type {
  BarOrder,
  BarOrderItem,
  BarOrderFormData,
  BarOrderItemFormData,
  BarOrderSummary,
  PercentageValidation,
} from '@/types/barOrder';

// =============================================================================
// Consumption Model Calculations
// =============================================================================

/**
 * Calculate total servings per person based on consumption model
 *
 * Formula: (first_hours * first_hours_drinks_per_hour) +
 *          (MAX(duration - first_hours, 0) * remaining_hours_drinks_per_hour)
 *
 * Example: 5-hour event with 2hr@2 + remainder@1
 * = (2 * 2) + (3 * 1) = 7 servings/person
 */
export function calculateTotalServingsPerPerson(
  eventDurationHours: number,
  firstHours: number,
  firstHoursDrinksPerHour: number,
  remainingHoursDrinksPerHour: number
): number {
  const firstHoursServings = firstHours * firstHoursDrinksPerHour;
  const remainingHours = Math.max(eventDurationHours - firstHours, 0);
  const remainingServings = remainingHours * remainingHoursDrinksPerHour;

  return firstHoursServings + remainingServings;
}

/**
 * Calculate servings per person from form data
 */
export function calculateServingsFromForm(form: BarOrderFormData): number {
  return calculateTotalServingsPerPerson(
    form.event_duration_hours,
    form.first_hours,
    form.first_hours_drinks_per_hour,
    form.remaining_hours_drinks_per_hour
  );
}

// =============================================================================
// Item Calculations
// =============================================================================

/**
 * Calculate servings for a single item
 *
 * Formula: total_servings_per_person * percentage * guest_count_adults
 *
 * Example: 7 servings/person * 0.40 (40% wine) * 150 guests = 420 servings
 */
export function calculateItemServings(
  totalServingsPerPerson: number,
  percentage: number,
  guestCountAdults: number
): number {
  return totalServingsPerPerson * percentage * guestCountAdults;
}

/**
 * Calculate units needed for an item (rounded up)
 *
 * Formula: CEIL(calculated_servings / servings_per_unit)
 *
 * Example: 420 servings / 4 servings per bottle = 105 bottles
 */
export function calculateUnitsNeeded(
  calculatedServings: number,
  servingsPerUnit: number
): number {
  if (servingsPerUnit <= 0) return 0;
  return Math.ceil(calculatedServings / servingsPerUnit);
}

/**
 * Calculate total cost for an item
 *
 * Formula: units_needed * cost_per_unit
 *
 * Example: 105 bottles * R150 = R15,750
 */
export function calculateItemTotalCost(
  unitsNeeded: number,
  costPerUnit: number | null
): number | null {
  if (costPerUnit === null) return null;
  return unitsNeeded * costPerUnit;
}

/**
 * Calculate all derived values for an item
 */
export function calculateItemValues(
  item: BarOrderItemFormData,
  totalServingsPerPerson: number,
  guestCountAdults: number
): {
  calculatedServings: number;
  unitsNeeded: number;
  totalCost: number | null;
} {
  const calculatedServings = calculateItemServings(
    totalServingsPerPerson,
    item.percentage,
    guestCountAdults
  );
  const unitsNeeded = calculateUnitsNeeded(calculatedServings, item.servings_per_unit);
  const totalCost = calculateItemTotalCost(unitsNeeded, item.cost_per_unit);

  return {
    calculatedServings,
    unitsNeeded,
    totalCost,
  };
}

// =============================================================================
// Summary Calculations
// =============================================================================

/**
 * Calculate summary totals for a bar order
 */
export function calculateBarOrderSummary(items: BarOrderItem[]): BarOrderSummary {
  return items.reduce(
    (summary, item) => ({
      totalUnits: summary.totalUnits + item.units_needed,
      totalCost: summary.totalCost + (item.total_cost ?? 0),
      totalPercentage: summary.totalPercentage + item.percentage,
      itemCount: summary.itemCount + 1,
    }),
    {
      totalUnits: 0,
      totalCost: 0,
      totalPercentage: 0,
      itemCount: 0,
    }
  );
}

/**
 * Calculate summary from bar order with relations
 */
export function calculateOrderSummary(order: BarOrder & { items: BarOrderItem[] }): BarOrderSummary {
  return calculateBarOrderSummary(order.items);
}

// =============================================================================
// Percentage Validation
// =============================================================================

/**
 * Validate total percentage and return validation result
 *
 * Rules:
 * - 100% = no warning (ideal)
 * - 90-110% = warning allowed, save enabled
 * - <90% or >110% = error, save blocked
 */
export function validatePercentageTotal(totalPercentage: number): PercentageValidation {
  // Convert to percentage for display (0.4 -> 40%)
  const displayPercentage = totalPercentage * 100;

  // Perfect
  if (Math.abs(displayPercentage - 100) < 0.01) {
    return {
      total: totalPercentage,
      isValid: true,
      isWarning: false,
      isError: false,
      message: null,
    };
  }

  // Within acceptable range (90-110%)
  if (displayPercentage >= 90 && displayPercentage <= 110) {
    return {
      total: totalPercentage,
      isValid: true,
      isWarning: true,
      isError: false,
      message: `Total is ${displayPercentage.toFixed(1)}%. Should be 100%.`,
    };
  }

  // Outside acceptable range
  return {
    total: totalPercentage,
    isValid: false,
    isWarning: false,
    isError: true,
    message: `Total percentage must be between 90% and 110%. Current: ${displayPercentage.toFixed(1)}%`,
  };
}

/**
 * Validate percentage total from items array
 */
export function validateItemsPercentage(items: BarOrderItem[]): PercentageValidation {
  const totalPercentage = items.reduce((sum, item) => sum + item.percentage, 0);
  return validatePercentageTotal(totalPercentage);
}

/**
 * Check if save should be blocked based on percentage validation
 */
export function shouldBlockSave(items: BarOrderItem[]): boolean {
  const validation = validateItemsPercentage(items);
  return validation.isError;
}

// =============================================================================
// Display Formatting
// =============================================================================

/**
 * Format currency for display (South African Rand)
 */
export function formatCurrency(amount: number | null): string {
  if (amount === null) return '-';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display (0.4 -> "40%")
 */
export function formatPercentage(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}

/**
 * Format servings per person for display
 */
export function formatServingsPerPerson(servings: number): string {
  return `${servings.toFixed(1)} servings/person`;
}

/**
 * Format units for display (with singular/plural)
 */
export function formatUnits(units: number, unitName: string = 'unit'): string {
  return `${units} ${units === 1 ? unitName : `${unitName}s`}`;
}

// =============================================================================
// Event Duration Helpers
// =============================================================================

/**
 * Calculate event duration in hours from start and end times
 */
export function calculateEventDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  return durationMs / (1000 * 60 * 60); // Convert to hours
}

/**
 * Format duration for display
 */
export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
}
