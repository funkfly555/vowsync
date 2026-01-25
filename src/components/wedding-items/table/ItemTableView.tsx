/**
 * ItemTableView - Main table container for wedding items
 * ALL fields as columns with inline editing (like Guest table)
 * @feature 031-items-card-table-view
 */

import { useState, useMemo, useCallback } from 'react';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import type { ItemSortConfig, ItemColumnFilter, ItemTableRow, ItemEventColumnMeta } from '@/types/item-table';
import { transformToTableRows, sortItems } from '@/lib/item-table-utils';
import { buildItemTableColumns } from './itemTableColumns';
import { ItemTableHeader } from './ItemTableHeader';
import { ItemTableBody } from './ItemTableBody';
import { ActiveFiltersBar } from './ActiveFiltersBar';

interface ItemTableViewProps {
  items: WeddingItemWithQuantities[];
  events: ItemEventColumnMeta[];
  weddingId: string;
  selectedItems: Set<string>;
  onSelectItem: (id: string, selected: boolean) => void;
  onSelectAll: (itemIds: string[]) => void;
  onEditItem: (item: WeddingItemWithQuantities) => void;
  onDeleteItem: (item: WeddingItemWithQuantities) => void;
}

/**
 * Apply column filters to rows
 */
function applyColumnFilters(
  rows: ItemTableRow[],
  filters: ItemColumnFilter[]
): ItemTableRow[] {
  if (filters.length === 0) return rows;

  return rows.filter((row) => {
    return filters.every((filter) => {
      const value = row[filter.column as keyof ItemTableRow];
      const normalizedValue = value === null || value === undefined ? '__null__' : String(value);

      if (filter.operator === 'in' && Array.isArray(filter.value)) {
        return filter.value.includes(normalizedValue);
      }

      return true;
    });
  });
}

/**
 * Main table view component for wedding items
 * Handles sorting, column filtering, and displays items in a FLAT table format
 * with inline editing (like Guest table)
 */
export function ItemTableView({
  items,
  events,
  weddingId,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onEditItem,
  onDeleteItem,
}: ItemTableViewProps) {
  // Sort state
  const [sortConfig, setSortConfig] = useState<ItemSortConfig>({
    column: null,
    direction: 'asc',
  });

  // Column filter state
  const [columnFilters, setColumnFilters] = useState<ItemColumnFilter[]>([]);

  // Build columns with dynamic event columns
  const columns = useMemo(
    () => buildItemTableColumns(events),
    [events]
  );

  // Transform items to table rows
  const allRows = useMemo(() => transformToTableRows(items), [items]);

  // Apply column filters
  const filteredRows = useMemo(
    () => applyColumnFilters(allRows, columnFilters),
    [allRows, columnFilters]
  );

  // Apply sorting
  const sortedRows = useMemo(
    () => sortItems(filteredRows, sortConfig),
    [filteredRows, sortConfig]
  );

  // Handle sort change (3-state toggle: asc -> desc -> none)
  const handleSortChange = useCallback((column: string) => {
    setSortConfig((prev) => {
      if (prev.column !== column) {
        return { column, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      return { column: null, direction: 'asc' };
    });
  }, []);

  // Handle column filter change
  const handleColumnFilterChange = useCallback((filter: ItemColumnFilter | null, columnId: string) => {
    setColumnFilters((prev) => {
      // Remove existing filter for this column
      const filtered = prev.filter((f) => f.column !== columnId);
      // Add new filter if provided
      if (filter) {
        return [...filtered, filter];
      }
      return filtered;
    });
  }, []);

  // Remove a single column filter
  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters((prev) => prev.filter((f) => f.column !== columnId));
  }, []);

  // Clear all column filters
  const handleClearAllFilters = useCallback(() => {
    setColumnFilters([]);
  }, []);

  // Selection state
  const allSelected = sortedRows.length > 0 && sortedRows.every((row) => selectedItems.has(row.id));
  const someSelected = sortedRows.some((row) => selectedItems.has(row.id));

  // Handle select all
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        onSelectAll(sortedRows.map((row) => row.id));
      } else {
        onSelectAll([]);
      }
    },
    [sortedRows, onSelectAll]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Active Filters Bar */}
      <ActiveFiltersBar
        filters={columnFilters}
        columns={columns}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Scrollable table container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <ItemTableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={handleSelectAll}
            data={allRows}
            columnFilters={columnFilters}
            onColumnFilterChange={handleColumnFilterChange}
          />
          <ItemTableBody
            rows={sortedRows}
            columns={columns}
            weddingId={weddingId}
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
          />
        </table>
      </div>

      {/* Footer with item count */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        {sortedRows.length} {sortedRows.length === 1 ? 'item' : 'items'} displayed
        {columnFilters.length > 0 && ` (filtered from ${allRows.length})`}
      </div>
    </div>
  );
}
