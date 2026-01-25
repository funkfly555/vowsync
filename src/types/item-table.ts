/**
 * Item Table TypeScript Types
 * Types for dual Card/Table view of wedding items
 * @feature 031-items-card-table-view
 */

import type { WeddingItemWithQuantities } from './weddingItem';

// =============================================================================
// View Mode Types
// =============================================================================

/**
 * View mode type for toggling between Card and Table views
 */
export type ItemViewMode = 'card' | 'table';

// =============================================================================
// Table Row Types
// =============================================================================

/**
 * Event quantity data for table row display
 * Includes is_max flag for MAX row highlighting
 */
export interface ItemEventQuantityDisplay {
  event_id: string;
  event_name: string;
  quantity_required: number;
  is_max: boolean;
}

/**
 * Table row type with computed fields for display
 * Extends WeddingItemWithQuantities with display-specific computed properties
 */
export interface ItemTableRow {
  id: string;
  wedding_id: string;
  description: string;
  category: string;
  aggregation_method: 'ADD' | 'MAX';
  total_required: number;
  number_available: number | null;
  availability_status: 'sufficient' | 'shortage' | 'unknown';
  shortage_amount?: number;
  cost_per_unit: number | null;
  cost_details: string | null;
  total_cost: number | null;
  supplier_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Event quantities as a lookup map for inline editing
  eventQuantities: ItemEventQuantityDisplay[];
  eventQuantityMap: Record<string, number>; // eventId -> quantity
  // Original item reference for mutations
  _original: WeddingItemWithQuantities;
}

// =============================================================================
// Sort and Filter Types
// =============================================================================

/**
 * Sort configuration for table columns
 */
export interface ItemSortConfig {
  column: string | null;
  direction: 'asc' | 'desc';
}

/**
 * Column filter type for Excel-style filtering
 */
export interface ItemColumnFilter {
  column: string;
  operator: 'in' | 'equals' | 'contains';
  value: string | string[];
}

/**
 * Filters state for the items page
 * Used by both Card and Table views
 */
export interface ItemFiltersState {
  search: string;
  category: string;
  supplier: string;
  aggregationMethod: string;
  availabilityStatus: string;
}

/**
 * Default filters state
 */
export const DEFAULT_ITEM_FILTERS: ItemFiltersState = {
  search: '',
  category: 'all',
  supplier: 'all',
  aggregationMethod: 'all',
  availabilityStatus: 'all',
};

// =============================================================================
// Column Definition Types
// =============================================================================

/**
 * Column type for different cell renderers
 */
export type ItemColumnType =
  | 'checkbox'
  | 'text'
  | 'textarea'
  | 'badge'
  | 'number'
  | 'currency'
  | 'datetime'
  | 'enum'
  | 'event-quantity'
  | 'actions';

/**
 * Column category for header grouping
 */
export type ItemColumnCategory =
  | 'select'
  | 'basic'
  | 'inventory'
  | 'cost'
  | 'other'
  | 'event'
  | 'actions';

/**
 * Table column definition with editing support
 */
export interface ItemTableColumnDef {
  id: string;
  header: string;
  field: string;
  type: ItemColumnType;
  category: ItemColumnCategory;
  width: number;
  minWidth?: number;
  filterable?: boolean;
  sortable?: boolean;
  editable?: boolean;
  enumOptions?: string[];
  // For event quantity columns
  eventId?: string;
  eventName?: string;
}

/**
 * Event metadata for generating event quantity columns
 */
export interface ItemEventColumnMeta {
  id: string;
  name: string;
  date: string;
}

// =============================================================================
// Cell Edit Types
// =============================================================================

/**
 * Payload for cell edit mutations
 */
export interface ItemCellEditPayload {
  itemId: string;
  weddingId: string;
  field: string;
  value: string | number | boolean | null;
  // For event quantity columns
  eventId?: string;
}

// =============================================================================
// Selection Types
// =============================================================================

/**
 * Selection state type - uses Set<string> for O(1) operations
 */
export type ItemSelectionState = Set<string>;

/**
 * Create empty selection state
 */
export function createEmptySelection(): ItemSelectionState {
  return new Set<string>();
}
