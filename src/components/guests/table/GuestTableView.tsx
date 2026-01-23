/**
 * GuestTableView - Main container for the Guest Table View
 * Displays all guest data in a comprehensive table format with 30+ columns
 * @feature 026-guest-view-toggle
 */

import { useState, useCallback, useMemo } from 'react';
import { useGuestTableData } from '@/hooks/useGuestTableData';
import { GuestTableHeader } from './GuestTableHeader';
import { GuestTableBody } from './GuestTableBody';
import { ActiveFiltersBar } from './ActiveFiltersBar';
import { sortRows } from '@/lib/guest-table-utils';
import type { GuestFiltersState } from '@/types/guest';
import type { SortConfig, ColumnFilter } from '@/types/guest-table';

interface GuestTableViewProps {
  weddingId: string;
  filters: GuestFiltersState;
  // Selection props
  selectedGuests?: Set<string>;
  onToggleSelect?: (guestId: string) => void;
  onSelectAll?: () => void;
}

/**
 * Comprehensive table view for all guest data
 * Features:
 * - 30 base columns grouped by category
 * - Dynamic event columns (up to 30 more)
 * - Category header row with color coding
 * - Horizontal scroll for wide tables
 * - Client-side sorting
 */
export function GuestTableView({
  weddingId,
  filters,
  selectedGuests = new Set(),
  onToggleSelect,
  onSelectAll,
}: GuestTableViewProps) {
  // Column filter state
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);

  // Fetch table data (with column filtering applied)
  const {
    rows,
    allRows,
    columns,
    events,
    mealOptions,
    isLoading,
    isError,
    totalCount,
  } = useGuestTableData({
    weddingId,
    filters,
    columnFilters,
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(undefined);

  // Handle sort click
  const handleSort = useCallback((column: string) => {
    setSortConfig((prev) => {
      if (prev?.column !== column) {
        return { column, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      // Third click clears sort
      return undefined;
    });
  }, []);

  // Handle column filter change
  const handleFilterChange = useCallback((columnId: string, filter: ColumnFilter | null) => {
    setColumnFilters((prev) => {
      // Remove existing filter for this column
      const filtered = prev.filter((f) => f.column !== columnId);
      // Add new filter if not null
      if (filter) {
        return [...filtered, filter];
      }
      return filtered;
    });
  }, []);

  // Handle removing a single filter
  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters((prev) => prev.filter((f) => f.column !== columnId));
  }, []);

  // Handle clearing all filters
  const handleClearAllFilters = useCallback(() => {
    setColumnFilters([]);
  }, []);

  // Apply sorting
  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;
    return sortRows(rows, sortConfig);
  }, [rows, sortConfig]);

  // Loading state
  if (isLoading) {
    return (
      <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="border border-red-200 rounded-lg p-8 bg-red-50">
        <p className="text-red-500 text-center">
          Error loading table data. Please try again.
        </p>
      </div>
    );
  }

  // Calculate plus ones for footer
  const plusOnesCount = rows.filter((r) => r.has_plus_one).length;

  return (
    <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
      {/* Active filters bar */}
      <ActiveFiltersBar
        filters={columnFilters}
        columns={columns}
        mealOptions={mealOptions}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Scrollable container with both horizontal and vertical scrolling */}
      <div className="overflow-auto max-h-[calc(100vh-320px)]">
        <table className="w-full border-collapse min-w-max">
          <GuestTableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            events={events}
            data={allRows}
            mealOptions={mealOptions}
            activeFilters={columnFilters}
            onFilterChange={handleFilterChange}
            totalRows={sortedRows.length}
            selectedCount={selectedGuests.size}
            onSelectAll={onSelectAll}
          />
          <GuestTableBody
            rows={sortedRows}
            columns={columns}
            mealOptions={mealOptions}
            weddingId={weddingId}
            selectedRows={selectedGuests}
            onSelectRow={onToggleSelect}
          />
        </table>
      </div>

      {/* Footer with stats */}
      <div className="px-4 py-3 bg-[#F5F5F5] border-t border-[#E8E8E8] text-sm text-gray-600 flex items-center justify-between">
        <div>
          <span className="font-medium">{rows.length}</span> guests displayed
          {totalCount !== rows.length && (
            <span className="text-gray-400 ml-1">
              (of {totalCount} total)
            </span>
          )}
          {columnFilters.length > 0 && (
            <span className="text-[#D4A5A5] ml-1">
              • {columnFilters.length} filter{columnFilters.length !== 1 ? 's' : ''} active
            </span>
          )}
          {plusOnesCount > 0 && (
            <span className="ml-2">
              + <span className="font-medium">{plusOnesCount}</span> plus ones
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {columns.length} columns
          {events.length > 0 && (
            <span className="ml-1">• {events.length} events</span>
          )}
        </div>
      </div>
    </div>
  );
}
