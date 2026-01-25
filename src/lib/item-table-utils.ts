/**
 * Item Table Utilities
 * Transform, filter, and sort functions for the item table view
 * @feature 031-items-card-table-view
 */

import type {
  ItemTableRow,
  ItemSortConfig,
  ItemColumnFilter,
  ItemFiltersState,
  ItemEventQuantityDisplay,
} from '@/types/item-table';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { checkAvailability } from '@/types/weddingItem';

// =============================================================================
// localStorage Helpers
// =============================================================================

const VIEW_PREFERENCE_KEY = 'itemsViewPreference';

/**
 * Get stored view preference from localStorage
 * Defaults to 'card' if not set or localStorage unavailable
 */
export function getItemViewPreference(): 'card' | 'table' {
  try {
    const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return stored === 'table' ? 'table' : 'card';
  } catch {
    return 'card';
  }
}

/**
 * Store view preference in localStorage
 * Silent fail if localStorage unavailable
 */
export function setItemViewPreference(mode: 'card' | 'table'): void {
  try {
    localStorage.setItem(VIEW_PREFERENCE_KEY, mode);
  } catch {
    // Silent fail if localStorage unavailable
  }
}

// =============================================================================
// Data Transformation
// =============================================================================

/**
 * Transform wedding items to table row format
 * Calculates availability status and marks MAX rows
 * Includes ALL fields for inline editing
 */
export function transformToTableRows(
  items: WeddingItemWithQuantities[]
): ItemTableRow[] {
  return items.map((item) => {
    const availabilityResult = checkAvailability(
      item.total_required,
      item.number_available
    );

    // Mark MAX rows for highlighting
    const eventQuantities = markMaxRows(
      item.event_quantities,
      item.aggregation_method
    );

    // Build eventQuantityMap for inline editing (eventId -> quantity)
    const eventQuantityMap: Record<string, number> = {};
    for (const eq of item.event_quantities) {
      eventQuantityMap[eq.event_id] = eq.quantity_required;
    }

    return {
      id: item.id,
      wedding_id: item.wedding_id,
      description: item.description,
      category: item.category,
      aggregation_method: item.aggregation_method,
      total_required: item.total_required,
      number_available: item.number_available,
      availability_status: availabilityResult.status,
      shortage_amount: availabilityResult.shortage,
      cost_per_unit: item.cost_per_unit,
      cost_details: item.cost_details,
      total_cost: item.total_cost,
      supplier_name: item.supplier_name,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      eventQuantities,
      eventQuantityMap,
      _original: item,
    };
  });
}

/**
 * Mark which event quantity rows are the MAX for MAX aggregation items
 * Used for blue highlighting in EventBreakdown
 */
export function markMaxRows(
  eventQuantities: WeddingItemWithQuantities['event_quantities'],
  aggregationMethod: 'ADD' | 'MAX'
): ItemEventQuantityDisplay[] {
  if (aggregationMethod !== 'MAX' || eventQuantities.length === 0) {
    return eventQuantities.map((eq) => ({
      event_id: eq.event_id,
      event_name: eq.event.event_name,
      quantity_required: eq.quantity_required,
      is_max: false,
    }));
  }

  // Find the maximum quantity
  const maxQuantity = Math.max(...eventQuantities.map((eq) => eq.quantity_required));

  return eventQuantities.map((eq) => ({
    event_id: eq.event_id,
    event_name: eq.event.event_name,
    quantity_required: eq.quantity_required,
    is_max: eq.quantity_required === maxQuantity && maxQuantity > 0,
  }));
}

// =============================================================================
// Filtering Functions
// =============================================================================

/**
 * Apply shared filters to table rows
 * Used by both Card and Table views
 */
export function applyItemFilters(
  rows: ItemTableRow[],
  filters: ItemFiltersState
): ItemTableRow[] {
  let result = [...rows];

  // Search filter (description only, with case-insensitive matching)
  if (filters.search.trim()) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter((row) =>
      row.description.toLowerCase().includes(searchLower)
    );
  }

  // Category filter
  if (filters.category !== 'all') {
    result = result.filter((row) => row.category === filters.category);
  }

  // Supplier filter
  if (filters.supplier !== 'all') {
    result = result.filter((row) => row.supplier_name === filters.supplier);
  }

  // Aggregation method filter
  if (filters.aggregationMethod !== 'all') {
    result = result.filter(
      (row) => row.aggregation_method === filters.aggregationMethod
    );
  }

  // Availability status filter
  if (filters.availabilityStatus !== 'all') {
    result = result.filter(
      (row) => row.availability_status === filters.availabilityStatus
    );
  }

  return result;
}

/**
 * Apply column-specific filters to rows
 * Uses AND logic - all filters must pass for a row to be included
 */
export function applyColumnFilters(
  rows: ItemTableRow[],
  filters: ItemColumnFilter[]
): ItemTableRow[] {
  if (filters.length === 0) return rows;

  return rows.filter((row) => {
    return filters.every((filter) => {
      const value = getNestedValue(row, filter.column);
      const normalizedValue = normalizeValueForFilter(value);

      switch (filter.operator) {
        case 'equals':
          return normalizedValue === filter.value;
        case 'contains':
          return String(value || '')
            .toLowerCase()
            .includes(String(filter.value).toLowerCase());
        case 'in':
          return (
            Array.isArray(filter.value) &&
            filter.value.includes(normalizedValue)
          );
        default:
          return true;
      }
    });
  });
}

/**
 * Normalize a value for filter comparison
 */
function normalizeValueForFilter(value: unknown): string {
  if (value === null || value === undefined) {
    return '__null__';
  }
  return String(value);
}

// =============================================================================
// Sorting Functions
// =============================================================================

/**
 * Sort rows by column
 */
export function sortItems(
  rows: ItemTableRow[],
  sortConfig: ItemSortConfig
): ItemTableRow[] {
  if (!sortConfig.column) return rows;

  const sorted = [...rows].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.column!);
    const bValue = getNestedValue(b, sortConfig.column!);

    // Handle null/undefined - push to end
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue;
    }

    // Handle strings (including dates as ISO strings)
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return aStr.localeCompare(bStr);
  });

  return sortConfig.direction === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Get nested value from object using dot notation path
 * e.g., getNestedValue(obj, 'eventQuantities.0.quantity_required')
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((curr: unknown, key: string) => {
    if (curr === null || curr === undefined) return undefined;
    return (curr as Record<string, unknown>)[key];
  }, obj);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format enum/snake_case value to display label
 */
export function formatEnumLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get unique values from data for a column (for filter dropdowns)
 */
export function getUniqueColumnValues(
  rows: ItemTableRow[],
  field: string
): string[] {
  const values = new Set<string>();
  for (const row of rows) {
    const value = getNestedValue(row, field);
    if (value !== null && value !== undefined) {
      values.add(String(value));
    }
  }
  return Array.from(values).sort();
}

/**
 * Build column ID to field path mapping from column definitions
 */
export function buildColumnFieldMap(
  columns: { id: string; field: string }[]
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const col of columns) {
    map[col.id] = col.field;
  }
  return map;
}
