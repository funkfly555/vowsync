/**
 * ItemTableHeader - Table header with column headers, sorting, and filtering
 * @feature 031-items-card-table-view
 * @task T010, T022, T023, T025
 */

import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { ItemTableColumnDef, ItemSortConfig, ItemTableRow, ItemColumnFilter } from '@/types/item-table';
import { ColumnFilterDropdown } from './ColumnFilterDropdown';

interface ItemTableHeaderProps {
  columns: ItemTableColumnDef[];
  sortConfig: ItemSortConfig;
  onSortChange: (column: string) => void;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (selected: boolean) => void;
  // T023: Column filter props
  data?: ItemTableRow[];
  columnFilters?: ItemColumnFilter[];
  onColumnFilterChange?: (filter: ItemColumnFilter | null, columnId: string) => void;
}

/**
 * Renders the table header with sorting, filtering, and select-all checkbox
 * T025: Sticky header with position sticky, top: 0
 */
export function ItemTableHeader({
  columns,
  sortConfig,
  onSortChange,
  allSelected,
  someSelected,
  onSelectAll,
  data = [],
  columnFilters = [],
  onColumnFilterChange,
}: ItemTableHeaderProps) {
  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (sortable) {
      onSortChange(columnId);
    }
  };

  // T022: 3-state sort icons (white for dusty rose header)
  const getSortIcon = (columnId: string) => {
    if (sortConfig.column !== columnId) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-white/60" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="h-3.5 w-3.5 text-white" />;
    }
    return <ArrowDown className="h-3.5 w-3.5 text-white" />;
  };

  // Get active filter for a column
  const getActiveFilter = (columnId: string) => {
    return columnFilters.find((f) => f.column === columnId);
  };

  return (
    <thead className="bg-[#D4A5A5] sticky top-0 z-10">
      <tr>
        {columns.map((column) => {
          if (column.type === 'checkbox') {
            return (
              <th
                key={column.id}
                className="px-3 py-3 text-center bg-[#D4A5A5]"
                style={{ width: column.width, minWidth: column.width }}
              >
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className={cn(
                    'border-white data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-[#D4A5A5]',
                    someSelected && !allSelected && 'data-[state=indeterminate]:bg-white'
                  )}
                  data-state={allSelected ? 'checked' : someSelected ? 'indeterminate' : 'unchecked'}
                  aria-label="Select all items"
                />
              </th>
            );
          }

          if (column.type === 'actions') {
            return (
              <th
                key={column.id}
                className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider bg-[#D4A5A5]"
                style={{ width: column.width, minWidth: column.width }}
              >
                {column.header}
              </th>
            );
          }

          const activeFilter = getActiveFilter(column.field);
          const hasFilter = Boolean(activeFilter);

          const isNumericColumn = column.type === 'number' || column.type === 'currency' || column.type === 'event-quantity';

          return (
            <th
              key={column.id}
              className={cn(
                'px-3 py-3 text-xs font-semibold text-white uppercase tracking-wider bg-[#D4A5A5]',
                isNumericColumn ? 'text-right' : 'text-left'
              )}
              style={{ width: column.width, minWidth: column.minWidth || column.width }}
            >
              <div
                className={cn(
                  'flex items-center gap-1',
                  isNumericColumn && 'justify-end'
                )}
              >
                {/* T023: Column filter dropdown for filterable columns */}
                {column.filterable && onColumnFilterChange && (
                  <ColumnFilterDropdown
                    column={column}
                    data={data}
                    activeFilter={activeFilter}
                    onFilterChange={(filter) => onColumnFilterChange(filter, column.field)}
                  />
                )}

                {/* Column header with sort */}
                <span
                  className={cn(
                    column.sortable && 'cursor-pointer hover:text-white/80 select-none',
                    hasFilter && 'underline decoration-2'
                  )}
                  onClick={() => handleSort(column.field, column.sortable)}
                >
                  {column.header}
                </span>

                {column.sortable && (
                  <span
                    className="cursor-pointer"
                    onClick={() => handleSort(column.field, column.sortable)}
                  >
                    {getSortIcon(column.field)}
                  </span>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
