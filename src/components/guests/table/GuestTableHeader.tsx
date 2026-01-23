/**
 * GuestTableHeader - Table header with category grouping and column headers
 * @feature 026-guest-view-toggle
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { groupColumnsByCategory, CATEGORY_CONFIG } from './tableColumns';
import { ColumnFilterDropdown } from './ColumnFilterDropdown';
import { Checkbox } from '@/components/ui/checkbox';
import type { TableColumnDef, SortConfig, EventColumnMeta, GuestTableRowData, MealOptionLookup, ColumnFilter } from '@/types/guest-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface GuestTableHeaderProps {
  columns: TableColumnDef[];
  sortConfig?: SortConfig;
  onSort?: (column: string) => void;
  events?: EventColumnMeta[];
  // Filtering props
  data?: GuestTableRowData[];
  mealOptions?: MealOptionLookup;
  activeFilters?: ColumnFilter[];
  onFilterChange?: (columnId: string, filter: ColumnFilter | null) => void;
  // Selection props
  totalRows?: number;
  selectedCount?: number;
  onSelectAll?: () => void;
}

/**
 * Generate HSL color for event columns
 * Uses golden ratio for even distribution
 */
function getEventColor(index: number): string {
  const hue = (index * 137.5) % 360; // Golden angle for distribution
  return `hsl(${hue}, 70%, 85%)`;
}

/**
 * Sort indicator component
 */
function SortIndicator({ direction }: { direction?: 'asc' | 'desc' }) {
  if (!direction) {
    return <ChevronsUpDown className="h-3 w-3 text-white/60" />;
  }
  return direction === 'asc' ? (
    <ChevronUp className="h-3 w-3 text-white" />
  ) : (
    <ChevronDown className="h-3 w-3 text-white" />
  );
}

/**
 * Check if a column should be filterable
 * Excludes: read-only columns (created_at, updated_at, id) and shuttle-info type
 */
function isColumnFilterable(column: TableColumnDef): boolean {
  // Exclude shuttle-info type (read-only display columns)
  if (column.type === 'shuttle-info') return false;

  // Exclude specific read-only columns
  if (['created_at', 'updated_at', 'id'].includes(column.id)) return false;

  return true;
}

/**
 * Renders the table header with category grouping row and column headers
 */
export const GuestTableHeader = memo(function GuestTableHeader({
  columns,
  sortConfig,
  onSort,
  events = [],
  data = [],
  mealOptions,
  activeFilters = [],
  onFilterChange,
  totalRows = 0,
  selectedCount = 0,
  onSelectAll,
}: GuestTableHeaderProps) {
  // Calculate checkbox states
  const hasSelection = selectedCount > 0;
  const allSelected = totalRows > 0 && selectedCount === totalRows;
  const isIndeterminate = hasSelection && !allSelected;
  const columnGroups = groupColumnsByCategory(columns);

  // Create event index map for color lookup
  const eventIndexMap = new Map(events.map((e, i) => [e.id, i]));

  return (
    <thead className="sticky top-0 z-30 bg-white">
      {/* Category header row */}
      <tr className="border-b border-[#E8E8E8] bg-white relative z-30">
        {/* Checkbox column header - spans both rows via rowSpan would be complex, so we use empty cell here */}
        {onSelectAll && (
          <th
            className="w-12 min-w-12 px-2 py-2 text-xs font-semibold text-center border-r border-[#E8E8E8] bg-white sticky left-0 z-40"
          >
            {/* Empty in category row - checkbox is in the column header row */}
          </th>
        )}
        {columnGroups.map((group, groupIndex) => {
          const isEvent = group.category === 'event' && group.eventId;
          const categoryConfig = CATEGORY_CONFIG[group.category];
          const eventColor = isEvent
            ? getEventColor(eventIndexMap.get(group.eventId!) ?? groupIndex)
            : undefined;

          return (
            <th
              key={`${group.category}-${group.eventId || groupIndex}`}
              colSpan={group.columns.length}
              className={cn(
                'px-2 py-2 text-xs font-semibold text-[#5C4B4B] text-center border-r border-[#E8E8E8] last:border-r-0',
                categoryConfig?.className
              )}
              style={isEvent ? { backgroundColor: eventColor } : undefined}
            >
              {isEvent ? group.eventName : categoryConfig?.label || group.category}
            </th>
          );
        })}
      </tr>

      {/* Column header row - Dusty rose brand color */}
      <tr className="bg-[#D4A5A5] border-b border-[#C99595] relative z-30">
        {/* Checkbox column - sticky */}
        {onSelectAll && (
          <th
            className="w-12 min-w-12 px-2 py-3 bg-[#D4A5A5] border-r border-[#C99595] sticky left-0 z-40"
          >
            <div className="flex items-center justify-center">
              <Checkbox
                checked={allSelected}
                data-state={isIndeterminate ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
                onCheckedChange={() => onSelectAll()}
                className="h-4 w-4 border-white data-[state=checked]:bg-white data-[state=checked]:text-[#D4A5A5] data-[state=indeterminate]:bg-white data-[state=indeterminate]:text-[#D4A5A5]"
                aria-label={allSelected ? 'Deselect all guests' : 'Select all guests'}
              />
            </div>
          </th>
        )}
        {columns.map((column) => {
          const isSorted = sortConfig?.column === column.id;
          const sortDirection = isSorted ? sortConfig.direction : undefined;
          const isFilterable = isColumnFilterable(column);
          const activeFilter = activeFilters.find((f) => f.column === column.id);

          return (
            <th
              key={column.id}
              className={cn(
                'px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider',
                onSort && 'cursor-pointer hover:bg-[#C99595] select-none'
              )}
              style={{ minWidth: column.minWidth, width: column.width }}
              onClick={() => onSort?.(column.id)}
            >
              <div className="flex items-center gap-1">
                <span className="truncate">{column.header}</span>
                {onSort && <SortIndicator direction={sortDirection} />}
                {isFilterable && onFilterChange && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ColumnFilterDropdown
                      column={column}
                      data={data}
                      mealOptions={mealOptions}
                      activeFilter={activeFilter}
                      onFilterChange={(filter) => onFilterChange(column.id, filter)}
                    />
                  </div>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
});
