/**
 * ActiveFiltersBar - Displays active column filters as removable badges
 * @feature 031-items-card-table-view
 * @task T021
 */

import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ItemColumnFilter, ItemTableColumnDef } from '@/types/item-table';

interface ActiveFiltersBarProps {
  filters: ItemColumnFilter[];
  columns: ItemTableColumnDef[];
  onRemoveFilter: (columnId: string) => void;
  onClearAll: () => void;
}

/**
 * Format filter values for display
 */
function formatFilterValue(value: string, column: ItemTableColumnDef): string {
  if (value === '__null__') {
    return 'Empty';
  }

  switch (column.type) {
    case 'badge':
      // Format enum-like values nicely
      if (value === 'sufficient') return 'Sufficient';
      if (value === 'shortage') return 'Shortage';
      if (value === 'unknown') return 'Unknown';
      if (value === 'ADD') return 'ADD';
      if (value === 'MAX') return 'MAX';
      return value;

    default:
      return value;
  }
}

/**
 * Display bar showing active filters with remove buttons
 */
export function ActiveFiltersBar({
  filters,
  columns,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersBarProps) {
  if (filters.length === 0) {
    return null;
  }

  // Create column lookup for display
  const columnMap = new Map(columns.map((c) => [c.id, c]));

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Filter className="h-4 w-4" />
        <span className="font-medium">Active Filters:</span>
      </div>

      {filters.map((filter) => {
        const column = columnMap.get(filter.column);
        if (!column) return null;

        // Get selected values (for 'in' operator)
        const selectedValues = Array.isArray(filter.value) ? filter.value : [String(filter.value)];
        const displayValues = selectedValues
          .slice(0, 3) // Show max 3 values
          .map((v) => formatFilterValue(v, column))
          .join(', ');
        const moreCount = selectedValues.length - 3;

        return (
          <Badge
            key={filter.column}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 bg-[#D4A5A5]/20 text-[#5C4B4B] border border-[#D4A5A5]/30 hover:bg-[#D4A5A5]/30"
          >
            <span className="font-medium">{column.header}:</span>
            <span className="max-w-[200px] truncate">
              {displayValues}
              {moreCount > 0 && ` +${moreCount} more`}
            </span>
            <button
              onClick={() => onRemoveFilter(filter.column)}
              className="ml-1 p-0.5 rounded-full hover:bg-[#D4A5A5]/50"
              aria-label={`Remove ${column.header} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
          onClick={onClearAll}
        >
          Clear All
        </Button>
      )}
    </div>
  );
}
