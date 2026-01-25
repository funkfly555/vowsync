/**
 * useItemTableData Hook
 * Transforms wedding items data for table view with sorting, filtering, and column filtering
 * @feature 031-items-card-table-view
 */

import { useMemo } from 'react';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import type {
  ItemTableRow,
  ItemSortConfig,
  ItemColumnFilter,
  ItemFiltersState,
} from '@/types/item-table';
import {
  transformToTableRows,
  applyItemFilters,
  applyColumnFilters,
  sortItems,
} from '@/lib/item-table-utils';

interface UseItemTableDataOptions {
  items: WeddingItemWithQuantities[];
  filters: ItemFiltersState;
  columnFilters?: ItemColumnFilter[];
  sortConfig?: ItemSortConfig;
}

interface UseItemTableDataResult {
  /** Transformed and filtered table rows */
  rows: ItemTableRow[];
  /** Total count before filtering */
  totalCount: number;
  /** Filtered count */
  filteredCount: number;
  /** Whether any filters are active */
  hasActiveFilters: boolean;
  /** Unique categories for filter dropdown */
  uniqueCategories: string[];
  /** Unique suppliers for filter dropdown */
  uniqueSuppliers: string[];
}

/**
 * Hook to transform wedding items data for table view
 * Handles data transformation, filtering, sorting, and column filtering
 */
export function useItemTableData({
  items,
  filters,
  columnFilters = [],
  sortConfig = { column: null, direction: 'asc' },
}: UseItemTableDataOptions): UseItemTableDataResult {
  // Transform items to table rows (once per items change)
  const allRows = useMemo(() => transformToTableRows(items), [items]);

  // Extract unique values for filter dropdowns
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    for (const item of items) {
      if (item.category) {
        categories.add(item.category);
      }
    }
    return Array.from(categories).sort();
  }, [items]);

  const uniqueSuppliers = useMemo(() => {
    const suppliers = new Set<string>();
    for (const item of items) {
      if (item.supplier_name) {
        suppliers.add(item.supplier_name);
      }
    }
    return Array.from(suppliers).sort();
  }, [items]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search.trim() !== '' ||
      filters.category !== 'all' ||
      filters.supplier !== 'all' ||
      filters.aggregationMethod !== 'all' ||
      filters.availabilityStatus !== 'all' ||
      columnFilters.length > 0
    );
  }, [filters, columnFilters]);

  // Apply all filters and sorting
  const rows = useMemo(() => {
    // Step 1: Apply shared filters
    let result = applyItemFilters(allRows, filters);

    // Step 2: Apply column-specific filters
    result = applyColumnFilters(result, columnFilters);

    // Step 3: Apply sorting
    result = sortItems(result, sortConfig);

    return result;
  }, [allRows, filters, columnFilters, sortConfig]);

  return {
    rows,
    totalCount: items.length,
    filteredCount: rows.length,
    hasActiveFilters,
    uniqueCategories,
    uniqueSuppliers,
  };
}
