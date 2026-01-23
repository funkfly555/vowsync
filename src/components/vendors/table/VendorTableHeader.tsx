/**
 * VendorTableHeader - Table header with category row, sort controls, and filter dropdowns
 * @feature 027-vendor-view-toggle
 *
 * Z-index layering:
 * - Category row: z-30
 * - Column header row: z-30
 * - Sticky column intersection: z-40
 */

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnFilterDropdown } from './ColumnFilterDropdown';
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  groupColumnsByCategory,
} from './tableColumns';
import type {
  VendorTableColumnDef,
  VendorTableRow,
  VendorSortConfig,
  VendorColumnFilter,
} from '@/types/vendor-table';

interface VendorTableHeaderProps {
  columns: VendorTableColumnDef[];
  rows: VendorTableRow[]; // For filter unique values
  sortConfig?: VendorSortConfig;
  onSort: (column: string) => void;
  columnFilters: VendorColumnFilter[];
  onFilterChange: (columnId: string, filter: VendorColumnFilter | null) => void;
  allSelected?: boolean;
  someSelected?: boolean;
  onSelectAll?: () => void;
}

/**
 * Table header with category row, column headers, sort, and filter controls
 */
export const VendorTableHeader = memo(function VendorTableHeader({
  columns,
  rows,
  sortConfig,
  onSort,
  columnFilters,
  onFilterChange,
  allSelected = false,
  someSelected = false,
  onSelectAll,
}: VendorTableHeaderProps) {
  // Group columns by category
  const columnsByCategory = useMemo(
    () => groupColumnsByCategory(columns),
    [columns]
  );

  // Get active filter for a column
  const getActiveFilter = (columnId: string) =>
    columnFilters.find((f) => f.column === columnId);

  // Render sort indicator
  const renderSortIndicator = (columnId: string) => {
    if (sortConfig?.column !== columnId) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <thead>
      {/* Category row */}
      <tr className="sticky top-0 z-30">
        {/* Checkbox column header - spans both rows */}
        <th
          rowSpan={2}
          className="sticky left-0 z-40 bg-[#D4A5A5] px-4 py-2 text-left text-xs font-semibold text-white border-r border-white/20"
          style={{ minWidth: 52 }}
        >
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            className={cn(
              'data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-[#D4A5A5]',
              someSelected && 'data-[state=indeterminate]:bg-white'
            )}
            data-state={
              allSelected ? 'checked' : someSelected ? 'indeterminate' : 'unchecked'
            }
            aria-label="Select all vendors"
          />
        </th>

        {/* Company name column header - spans both rows, sticky */}
        <th
          rowSpan={2}
          className="sticky left-[52px] z-40 bg-[#D4A5A5] px-4 py-2 text-left text-xs font-semibold text-white border-r border-white/20 cursor-pointer hover:bg-[#c49494]"
          style={{ minWidth: 200 }}
          onClick={() => onSort('company_name')}
        >
          <div className="flex items-center gap-2">
            <span>Company</span>
            {renderSortIndicator('company_name')}
            <ColumnFilterDropdown
              column={columns.find((c) => c.id === 'company_name')!}
              data={rows}
              activeFilter={getActiveFilter('company_name')}
              onFilterChange={(filter) => onFilterChange('company_name', filter)}
            />
          </div>
        </th>

        {/* Category headers */}
        {CATEGORY_ORDER.map((category) => {
          const categoryColumns = columnsByCategory.get(category);
          if (!categoryColumns || categoryColumns.length === 0) return null;

          // Skip company_name as it's already rendered sticky
          const filteredColumns = categoryColumns.filter(
            (c) => c.id !== 'company_name'
          );
          if (filteredColumns.length === 0) return null;

          const config = CATEGORY_CONFIG[category];

          return (
            <th
              key={category}
              colSpan={filteredColumns.length}
              className={cn(
                'px-4 py-1.5 text-center text-xs font-semibold text-gray-700 border-b border-gray-200',
                config.color
              )}
            >
              {config.label}
            </th>
          );
        })}
      </tr>

      {/* Column header row */}
      <tr className="sticky top-[30px] z-30 bg-[#D4A5A5]">
        {/* Already rendered checkbox and company_name with rowSpan=2 */}

        {/* Other column headers */}
        {CATEGORY_ORDER.map((category) => {
          const categoryColumns = columnsByCategory.get(category);
          if (!categoryColumns || categoryColumns.length === 0) return null;

          // Skip company_name as it's already rendered sticky
          const filteredColumns = categoryColumns.filter(
            (c) => c.id !== 'company_name'
          );
          if (filteredColumns.length === 0) return null;

          return filteredColumns.map((column) => (
            <th
              key={column.id}
              className={cn(
                'px-4 py-2 text-left text-xs font-semibold text-white border-r border-white/10 last:border-r-0',
                column.editable && 'cursor-pointer hover:bg-[#c49494]'
              )}
              style={{ minWidth: column.minWidth, width: column.width }}
              onClick={() => onSort(column.id)}
            >
              <div className="flex items-center gap-1.5">
                <span className="truncate">{column.header}</span>
                {renderSortIndicator(column.id)}
                <ColumnFilterDropdown
                  column={column}
                  data={rows}
                  activeFilter={getActiveFilter(column.id)}
                  onFilterChange={(filter) => onFilterChange(column.id, filter)}
                />
              </div>
            </th>
          ));
        })}
      </tr>
    </thead>
  );
});
