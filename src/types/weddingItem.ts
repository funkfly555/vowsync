/**
 * Wedding Item TypeScript Types
 * @feature 013-wedding-items
 */

// =============================================================================
// Aggregation Method Type
// =============================================================================

/**
 * Aggregation method enumeration
 * ADD: Sum all event quantities (for consumables like napkins)
 * MAX: Take maximum event quantity (for reusables like tables)
 */
export type AggregationMethod = 'ADD' | 'MAX';

// =============================================================================
// Database Entity Types
// =============================================================================

/**
 * Database entity - mirrors Supabase wedding_items table
 */
export interface WeddingItem {
  id: string;
  wedding_id: string;
  category: string;
  description: string;
  aggregation_method: AggregationMethod;
  number_available: number | null;
  total_required: number;
  cost_per_unit: number | null;
  cost_details: string | null;
  total_cost: number | null;
  supplier_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database entity - mirrors Supabase wedding_item_event_quantities table
 */
export interface WeddingItemEventQuantity {
  id: string;
  wedding_item_id: string;
  event_id: string;
  quantity_required: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Extended Types with Relations
// =============================================================================

/**
 * Event quantity with event details for display
 */
export interface WeddingItemEventQuantityWithEvent extends WeddingItemEventQuantity {
  event: {
    id: string;
    event_name: string;
    event_date: string;
  };
}

/**
 * Wedding item with related event quantities for detail views
 */
export interface WeddingItemWithQuantities extends WeddingItem {
  event_quantities: WeddingItemEventQuantityWithEvent[];
}

// =============================================================================
// Form Types
// =============================================================================

/**
 * Form data for create/edit wedding item modal
 */
export interface WeddingItemFormData {
  category: string;
  description: string;
  aggregation_method: AggregationMethod;
  number_available: number | null;
  cost_per_unit: number | null;
  cost_details: string | null;
  supplier_name: string | null;
  notes: string | null;
  event_quantities: Record<string, number>; // eventId -> quantity
}

/**
 * Default form values for new wedding item
 */
export const DEFAULT_WEDDING_ITEM_FORM: WeddingItemFormData = {
  category: '',
  description: '',
  aggregation_method: 'MAX',
  number_available: null,
  cost_per_unit: null,
  cost_details: null,
  supplier_name: null,
  notes: null,
  event_quantities: {},
};

// =============================================================================
// Availability Status Types
// =============================================================================

/**
 * Availability status type for display
 */
export type AvailabilityStatusType = 'sufficient' | 'shortage' | 'unknown';

/**
 * Availability status for display with message
 */
export interface AvailabilityStatus {
  status: AvailabilityStatusType;
  shortage?: number;
  message: string;
}

// =============================================================================
// Summary Types
// =============================================================================

/**
 * Summary statistics for wedding items list
 */
export interface WeddingItemsSummary {
  totalItems: number;
  totalCost: number;
  itemsWithCost: number;
  itemsWithoutCost: number;
  shortageCount: number;
  sufficientCount: number;
  unknownAvailabilityCount: number;
}

// =============================================================================
// Event Option Types (for dropdown)
// =============================================================================

/**
 * Event option for quantity table
 */
export interface EventOption {
  id: string;
  event_name: string;
  event_date: string;
}

// =============================================================================
// Suggested Categories
// =============================================================================

export const SUGGESTED_CATEGORIES = [
  'Tables',
  'Chairs',
  'Linens',
  'Decorations',
  'Lighting',
  'Audio/Visual',
  'Tableware',
  'Glassware',
  'Serveware',
  'Furniture',
  'Signage',
  'Other',
] as const;

export type SuggestedCategory = typeof SUGGESTED_CATEGORIES[number];

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Calculate total_required based on aggregation method
 * @param aggregationMethod - 'ADD' or 'MAX'
 * @param eventQuantities - Array of quantity values
 * @returns Calculated total required
 */
export function calculateTotalRequired(
  aggregationMethod: AggregationMethod,
  eventQuantities: number[]
): number {
  if (eventQuantities.length === 0) return 0;

  if (aggregationMethod === 'ADD') {
    return eventQuantities.reduce((sum, qty) => sum + qty, 0);
  } else {
    return Math.max(...eventQuantities);
  }
}

/**
 * Determine availability status based on total required and available
 * @param totalRequired - Total quantity required
 * @param numberAvailable - Number available (or null if not set)
 * @returns Availability status object with status, shortage, and message
 */
export function checkAvailability(
  totalRequired: number,
  numberAvailable: number | null
): AvailabilityStatus {
  if (numberAvailable === null) {
    return { status: 'unknown', message: 'Availability not set' };
  }

  if (numberAvailable >= totalRequired) {
    return { status: 'sufficient', message: `${numberAvailable} available` };
  }

  const shortage = totalRequired - numberAvailable;
  return {
    status: 'shortage',
    shortage,
    message: `Short by ${shortage}`,
  };
}

/**
 * Calculate total cost from total required and cost per unit
 * @param totalRequired - Total quantity required
 * @param costPerUnit - Cost per unit (or null if not set)
 * @returns Total cost or null if cost per unit is not set
 */
export function calculateTotalCost(
  totalRequired: number,
  costPerUnit: number | null
): number | null {
  if (costPerUnit === null) return null;
  return totalRequired * costPerUnit;
}

/**
 * Calculate summary statistics from a list of wedding items
 * @param items - List of wedding items with quantities
 * @returns Summary statistics object
 */
export function calculateSummary(items: WeddingItemWithQuantities[]): WeddingItemsSummary {
  let totalCost = 0;
  let itemsWithCost = 0;
  let itemsWithoutCost = 0;
  let shortageCount = 0;
  let sufficientCount = 0;
  let unknownAvailabilityCount = 0;

  for (const item of items) {
    // Cost tracking
    if (item.total_cost !== null) {
      totalCost += item.total_cost;
      itemsWithCost++;
    } else {
      itemsWithoutCost++;
    }

    // Availability tracking
    const status = checkAvailability(item.total_required, item.number_available);
    if (status.status === 'shortage') {
      shortageCount++;
    } else if (status.status === 'sufficient') {
      sufficientCount++;
    } else {
      unknownAvailabilityCount++;
    }
  }

  return {
    totalItems: items.length,
    totalCost,
    itemsWithCost,
    itemsWithoutCost,
    shortageCount,
    sufficientCount,
    unknownAvailabilityCount,
  };
}

/**
 * Format currency value in South African Rand
 * @param value - Numeric value to format
 * @returns Formatted currency string (e.g., "R 1,234.56")
 */
export function formatCurrency(value: number): string {
  return `R ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format large numbers with thousand separators
 * @param value - Numeric value to format
 * @returns Formatted number string (e.g., "10,000")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-ZA');
}
