/**
 * VendorTableView - Main table container with scroll handling
 * @feature 027-vendor-view-toggle
 */

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useVendorTableData } from '@/hooks/useVendorTableData';
import { sortVendorRows } from '@/lib/vendor-table-utils';
import { VendorTableHeader } from './VendorTableHeader';
import { VendorTableRow } from './VendorTableRow';
import { ActiveFiltersBar } from './ActiveFiltersBar';
import { VENDOR_TABLE_COLUMNS } from './tableColumns';
import type {
  VendorFiltersState,
  VendorColumnFilter,
  VendorSortConfig,
} from '@/types/vendor-table';

interface VendorTableViewProps {
  weddingId: string;
  filters?: VendorFiltersState;
  selectedVendors: Set<string>;
  onToggleSelect: (vendorId: string) => void;
  onSelectAll: () => void;
  className?: string;
}

/**
 * Skeleton loader for table
 */
function TableSkeleton() {
  return (
    <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A5A5]" />
      </div>
    </div>
  );
}

/**
 * Empty state when no vendors match filters
 */
function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-gray-400 mb-4">
        <svg
          className="h-16 w-16 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-1">
        {hasFilters ? 'No vendors match your filters' : 'No vendors yet'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {hasFilters
          ? 'Try adjusting your filter criteria'
          : 'Add your first vendor to get started'}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm font-medium text-[#D4A5A5] hover:text-[#c49494] hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

/**
 * Table footer with row/column count
 */
function TableFooter({
  rowCount,
  columnCount,
  selectedCount,
}: {
  rowCount: number;
  columnCount: number;
  selectedCount: number;
}) {
  return (
    <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
      <span>
        {rowCount} vendor{rowCount !== 1 ? 's' : ''} • {columnCount} columns
      </span>
      {selectedCount > 0 && (
        <span className="text-[#D4A5A5] font-medium">
          {selectedCount} selected
        </span>
      )}
    </div>
  );
}

/**
 * Main vendor table view component
 */
export function VendorTableView({
  weddingId,
  filters,
  selectedVendors,
  onToggleSelect,
  onSelectAll,
  className,
}: VendorTableViewProps) {
  // Column-specific filters (separate from shared VendorFilters)
  const [columnFilters, setColumnFilters] = useState<VendorColumnFilter[]>([]);

  // Sort configuration
  const [sortConfig, setSortConfig] = useState<VendorSortConfig | undefined>();

  // Fetch data
  const { rows, columns, isLoading, isError, error } = useVendorTableData({
    weddingId,
    filters,
    columnFilters,
  });

  // Apply sorting
  const sortedRows = useMemo(
    () => sortVendorRows(rows, sortConfig),
    [rows, sortConfig]
  );

  // Handle sort click (cycle: none -> asc -> desc -> none)
  const handleSort = useCallback((columnId: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.column !== columnId) {
        return { column: columnId, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column: columnId, direction: 'desc' };
      }
      return undefined; // Clear sort
    });
  }, []);

  // Handle filter change for a column
  const handleFilterChange = useCallback(
    (columnId: string, filter: VendorColumnFilter | null) => {
      setColumnFilters((prev) => {
        // Remove existing filter for this column
        const filtered = prev.filter((f) => f.column !== columnId);
        // Add new filter if provided
        if (filter) {
          return [...filtered, filter];
        }
        return filtered;
      });
    },
    []
  );

  // Handle removing a filter
  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters((prev) => prev.filter((f) => f.column !== columnId));
  }, []);

  // Handle clearing all column filters
  const handleClearAllFilters = useCallback(() => {
    setColumnFilters([]);
  }, []);

  // Check selection state
  const allSelected = sortedRows.length > 0 && sortedRows.every((r) => selectedVendors.has(r.id));
  const someSelected = sortedRows.some((r) => selectedVendors.has(r.id)) && !allSelected;

  // Loading state
  if (isLoading) {
    return <TableSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="border border-red-200 rounded-lg bg-red-50 p-8 text-center">
        <p className="text-red-600 font-medium">Failed to load vendors</p>
        <p className="text-red-500 text-sm mt-1">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  // Check if there are any active filters
  const hasFilters = columnFilters.length > 0 || (filters?.search ?? '') !== '';

  // Empty state
  if (sortedRows.length === 0) {
    return (
      <div className={cn('border border-[#E8E8E8] rounded-lg bg-white', className)}>
        <EmptyState hasFilters={hasFilters} onClearFilters={handleClearAllFilters} />
      </div>
    );
  }

  return (
    <div className={cn('border border-[#E8E8E8] rounded-lg bg-white overflow-hidden', className)}>
      {/* Active filters bar */}
      <ActiveFiltersBar
        filters={columnFilters}
        columns={columns}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Scrollable table container */}
      <div className="overflow-auto max-h-[calc(100vh-320px)]">
        <table className="w-full border-collapse min-w-max">
          <VendorTableHeader
            columns={columns}
            rows={rows} // Pass unfiltered rows for filter dropdowns
            sortConfig={sortConfig}
            onSort={handleSort}
            columnFilters={columnFilters}
            onFilterChange={handleFilterChange}
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={onSelectAll}
          />
          <tbody>
            {sortedRows.map((row) => (
              <VendorTableRow
                key={row.id}
                row={row}
                columns={VENDOR_TABLE_COLUMNS}
                weddingId={weddingId}
                isSelected={selectedVendors.has(row.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <TableFooter
        rowCount={sortedRows.length}
        columnCount={columns.length + 1} // +1 for checkbox column
        selectedCount={selectedVendors.size}
      />
    </div>
  );
}
