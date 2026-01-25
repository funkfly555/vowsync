/**
 * Item Table Column Definitions
 * ALL fields as columns with inline editing support (like Guest table)
 * @feature 031-items-card-table-view
 */

import type { ItemTableColumnDef, ItemEventColumnMeta } from '@/types/item-table';
import { SUGGESTED_CATEGORIES } from '@/types/weddingItem';

/**
 * Base column definitions for the items table
 * ALL fields from WeddingItem type are included
 */
export const BASE_ITEM_COLUMNS: ItemTableColumnDef[] = [
  // Selection column
  {
    id: 'select',
    header: '',
    field: 'id',
    type: 'checkbox',
    category: 'select',
    width: 40,
    minWidth: 40,
    filterable: false,
    sortable: false,
    editable: false,
  },

  // Basic Info columns
  {
    id: 'description',
    header: 'Description',
    field: 'description',
    type: 'text',
    category: 'basic',
    width: 200,
    minWidth: 150,
    filterable: false,
    sortable: true,
    editable: true,
  },
  {
    id: 'category',
    header: 'Category',
    field: 'category',
    type: 'enum',
    category: 'basic',
    width: 140,
    minWidth: 100,
    filterable: true,
    sortable: true,
    editable: true,
    enumOptions: [...SUGGESTED_CATEGORIES],
  },
  {
    id: 'aggregation_method',
    header: 'Method',
    field: 'aggregation_method',
    type: 'enum',
    category: 'basic',
    width: 100,
    minWidth: 80,
    filterable: true,
    sortable: true,
    editable: true,
    enumOptions: ['ADD', 'MAX'],
  },
  {
    id: 'supplier_name',
    header: 'Supplier',
    field: 'supplier_name',
    type: 'text',
    category: 'basic',
    width: 150,
    minWidth: 100,
    filterable: true,
    sortable: true,
    editable: true,
  },

  // Inventory columns
  {
    id: 'total_required',
    header: 'Need',
    field: 'total_required',
    type: 'number',
    category: 'inventory',
    width: 80,
    minWidth: 60,
    filterable: false,
    sortable: true,
    editable: false, // Computed from event quantities
  },
  {
    id: 'number_available',
    header: 'Have',
    field: 'number_available',
    type: 'number',
    category: 'inventory',
    width: 80,
    minWidth: 60,
    filterable: false,
    sortable: true,
    editable: true,
  },
  {
    id: 'availability_status',
    header: 'Status',
    field: 'availability_status',
    type: 'badge',
    category: 'inventory',
    width: 120,
    minWidth: 100,
    filterable: true,
    sortable: true,
    editable: false, // Computed
  },

  // Cost columns
  {
    id: 'cost_per_unit',
    header: 'Unit Cost',
    field: 'cost_per_unit',
    type: 'currency',
    category: 'cost',
    width: 100,
    minWidth: 80,
    filterable: false,
    sortable: true,
    editable: true,
  },
  {
    id: 'total_cost',
    header: 'Total Cost',
    field: 'total_cost',
    type: 'currency',
    category: 'cost',
    width: 100,
    minWidth: 80,
    filterable: false,
    sortable: true,
    editable: false, // Computed
  },
  {
    id: 'cost_details',
    header: 'Cost Details',
    field: 'cost_details',
    type: 'textarea',
    category: 'cost',
    width: 180,
    minWidth: 120,
    filterable: false,
    sortable: false,
    editable: true,
  },

  // Other columns
  {
    id: 'notes',
    header: 'Notes',
    field: 'notes',
    type: 'textarea',
    category: 'other',
    width: 200,
    minWidth: 140,
    filterable: false,
    sortable: false,
    editable: true,
  },
  {
    id: 'created_at',
    header: 'Created',
    field: 'created_at',
    type: 'datetime',
    category: 'other',
    width: 160,
    minWidth: 140,
    filterable: false,
    sortable: true,
    editable: false,
  },
  {
    id: 'updated_at',
    header: 'Updated',
    field: 'updated_at',
    type: 'datetime',
    category: 'other',
    width: 160,
    minWidth: 140,
    filterable: false,
    sortable: true,
    editable: false,
  },

  // Actions column (at the end)
  {
    id: 'actions',
    header: 'Actions',
    field: 'id',
    type: 'actions',
    category: 'actions',
    width: 80,
    minWidth: 80,
    filterable: false,
    sortable: false,
    editable: false,
  },
];

/**
 * Generate event quantity columns for a list of events
 * Each event gets ONE column showing the quantity required for that event
 */
export function generateEventQuantityColumns(events: ItemEventColumnMeta[]): ItemTableColumnDef[] {
  return events.map((event) => ({
    id: `event_qty_${event.id}`,
    header: event.name,
    field: `eventQuantityMap.${event.id}`,
    type: 'event-quantity' as const,
    category: 'event' as const,
    width: 100,
    minWidth: 80,
    filterable: false,
    sortable: true,
    editable: true,
    eventId: event.id,
    eventName: event.name,
  }));
}

/**
 * Build complete columns array with event columns inserted before Actions
 */
export function buildItemTableColumns(events: ItemEventColumnMeta[]): ItemTableColumnDef[] {
  // Find index of actions column
  const actionsIndex = BASE_ITEM_COLUMNS.findIndex((col) => col.id === 'actions');

  if (actionsIndex === -1) {
    // No actions column, just append event columns
    return [...BASE_ITEM_COLUMNS, ...generateEventQuantityColumns(events)];
  }

  // Insert event columns before actions
  const beforeActions = BASE_ITEM_COLUMNS.slice(0, actionsIndex);
  const actionsColumn = BASE_ITEM_COLUMNS[actionsIndex];
  const eventColumns = generateEventQuantityColumns(events);

  return [...beforeActions, ...eventColumns, actionsColumn];
}

/**
 * Legacy export for backwards compatibility
 * Use buildItemTableColumns() instead for dynamic event columns
 */
export const ITEM_TABLE_COLUMNS = BASE_ITEM_COLUMNS;

/**
 * Get filterable columns
 */
export function getFilterableColumns(columns: ItemTableColumnDef[]): ItemTableColumnDef[] {
  return columns.filter((col) => col.filterable);
}

/**
 * Get sortable columns
 */
export function getSortableColumns(columns: ItemTableColumnDef[]): ItemTableColumnDef[] {
  return columns.filter((col) => col.sortable);
}

/**
 * Build column ID to field mapping
 */
export function buildColumnFieldMap(columns: ItemTableColumnDef[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const col of columns) {
    map[col.id] = col.field;
  }
  return map;
}

/**
 * Category configuration for header rendering
 */
export const ITEM_CATEGORY_CONFIG: Record<string, { label: string; className: string }> = {
  select: { label: '', className: '' },
  basic: { label: 'Basic Info', className: 'bg-[#F5F5F5]' },
  inventory: { label: 'Inventory', className: 'bg-[#F5F5F5]' },
  cost: { label: 'Cost', className: 'bg-[#F5F5F5]' },
  other: { label: 'Other', className: 'bg-[#F5F5F5]' },
  event: { label: 'Events', className: '' }, // Dynamic per event
  actions: { label: '', className: '' },
};
