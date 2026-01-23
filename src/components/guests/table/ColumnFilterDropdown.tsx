/**
 * ColumnFilterDropdown - Excel-style column filtering with checkboxes
 * @feature 026-guest-view-toggle
 */

import { useState, useMemo, useCallback } from 'react';
import { Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatEnumLabel } from '@/lib/guest-table-utils';
import type { TableColumnDef, GuestTableRowData, MealOptionLookup, ColumnFilter } from '@/types/guest-table';

interface ColumnFilterDropdownProps {
  column: TableColumnDef;
  data: GuestTableRowData[];
  mealOptions?: MealOptionLookup;
  activeFilter?: ColumnFilter;
  onFilterChange: (filter: ColumnFilter | null) => void;
}

/**
 * Get nested value from object using dot notation path
 */
function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Format a value for display based on column type
 */
function formatValueForDisplay(
  value: unknown,
  column: TableColumnDef,
  mealOptions?: MealOptionLookup
): string {
  if (value === null || value === undefined) {
    return '(Empty)';
  }

  switch (column.type) {
    case 'boolean':
      return value ? 'Yes' : 'No';

    case 'enum':
      return formatEnumLabel(value as string);

    case 'meal':
      if (mealOptions && column.courseType) {
        const mealName = mealOptions[column.courseType]?.[value as number];
        return mealName || String(value);
      }
      return String(value);

    case 'date':
      if (typeof value === 'string') {
        try {
          return new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } catch {
          return String(value);
        }
      }
      return String(value);

    case 'shuttle-toggle':
      return value === 'Yes' ? 'Yes' : 'No';

    default:
      return String(value);
  }
}

/**
 * Get a normalized value for comparison/storage
 */
function getNormalizedValue(value: unknown, column: TableColumnDef): string {
  if (value === null || value === undefined) {
    return '__null__';
  }

  switch (column.type) {
    case 'boolean':
      return value ? 'true' : 'false';

    case 'shuttle-toggle':
      return value === 'Yes' ? 'Yes' : 'No';

    default:
      return String(value);
  }
}

/**
 * Extract unique values from data for a column
 */
function getUniqueValues(
  data: GuestTableRowData[],
  column: TableColumnDef,
  mealOptions?: MealOptionLookup
): { value: string; display: string; count: number }[] {
  const valueMap = new Map<string, { display: string; count: number }>();

  for (const row of data) {
    const rawValue = getValueByPath(row as unknown as Record<string, unknown>, column.field);
    const normalizedValue = getNormalizedValue(rawValue, column);
    const displayValue = formatValueForDisplay(rawValue, column, mealOptions);

    if (valueMap.has(normalizedValue)) {
      const existing = valueMap.get(normalizedValue)!;
      existing.count++;
    } else {
      valueMap.set(normalizedValue, { display: displayValue, count: 1 });
    }
  }

  // Convert to array and sort
  const values = Array.from(valueMap.entries()).map(([value, { display, count }]) => ({
    value,
    display,
    count,
  }));

  // Sort: non-empty values first alphabetically, then empty at end
  values.sort((a, b) => {
    if (a.value === '__null__' && b.value !== '__null__') return 1;
    if (a.value !== '__null__' && b.value === '__null__') return -1;
    return a.display.localeCompare(b.display);
  });

  return values;
}

/**
 * Excel-style column filter dropdown with checkboxes
 */
export function ColumnFilterDropdown({
  column,
  data,
  mealOptions,
  activeFilter,
  onFilterChange,
}: ColumnFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique values for this column
  const uniqueValues = useMemo(
    () => getUniqueValues(data, column, mealOptions),
    [data, column, mealOptions]
  );

  // Filter values based on search term
  const filteredValues = useMemo(() => {
    if (!searchTerm.trim()) return uniqueValues;
    const term = searchTerm.toLowerCase();
    return uniqueValues.filter((v) => v.display.toLowerCase().includes(term));
  }, [uniqueValues, searchTerm]);

  // Currently selected values (from active filter)
  const selectedValues = useMemo(() => {
    if (!activeFilter || activeFilter.operator !== 'in') {
      return new Set<string>();
    }
    return new Set(activeFilter.value as string[]);
  }, [activeFilter]);

  // Check if all filtered values are selected
  const allSelected = filteredValues.length > 0 &&
    filteredValues.every((v) => selectedValues.has(v.value));

  // Check if some (but not all) filtered values are selected
  const someSelected = filteredValues.some((v) => selectedValues.has(v.value)) && !allSelected;

  // Handle individual value toggle
  const handleValueToggle = useCallback(
    (value: string, checked: boolean) => {
      const newSelected = new Set(selectedValues);

      if (checked) {
        newSelected.add(value);
      } else {
        newSelected.delete(value);
      }

      // If no values selected, clear the filter
      if (newSelected.size === 0) {
        onFilterChange(null);
      } else {
        onFilterChange({
          column: column.id,
          operator: 'in',
          value: Array.from(newSelected),
        });
      }
    },
    [column.id, selectedValues, onFilterChange]
  );

  // Handle select all / deselect all
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      // Deselect all filtered values
      const newSelected = new Set(selectedValues);
      for (const v of filteredValues) {
        newSelected.delete(v.value);
      }
      if (newSelected.size === 0) {
        onFilterChange(null);
      } else {
        onFilterChange({
          column: column.id,
          operator: 'in',
          value: Array.from(newSelected),
        });
      }
    } else {
      // Select all filtered values
      const newSelected = new Set(selectedValues);
      for (const v of filteredValues) {
        newSelected.add(v.value);
      }
      onFilterChange({
        column: column.id,
        operator: 'in',
        value: Array.from(newSelected),
      });
    }
  }, [allSelected, column.id, filteredValues, selectedValues, onFilterChange]);

  // Clear this filter
  const handleClearFilter = useCallback(() => {
    onFilterChange(null);
    setSearchTerm('');
  }, [onFilterChange]);

  // Check if filter is active
  const hasActiveFilter = selectedValues.size > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'p-0.5 rounded hover:bg-white/20 transition-colors',
            hasActiveFilter && 'text-white bg-white/30'
          )}
          aria-label={`Filter ${column.header}`}
        >
          <Filter className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0"
        align="start"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            Filter: {column.header}
          </span>
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
              onClick={handleClearFilter}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Search Input */}
        <div className="px-3 py-2 border-b border-gray-200">
          <Input
            type="text"
            placeholder="Search values..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {/* Select All / Deselect All */}
        <div
          className="px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          onClick={handleSelectAll}
        >
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              className={cn(
                'data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]',
                someSelected && 'data-[state=indeterminate]:bg-[#D4A5A5]'
              )}
              // Use indeterminate state when some but not all selected
              data-state={allSelected ? 'checked' : someSelected ? 'indeterminate' : 'unchecked'}
            />
            <span className="text-sm font-medium text-gray-700">
              {allSelected ? 'Deselect All' : 'Select All'}
            </span>
            <span className="ml-auto text-xs text-gray-400">
              ({filteredValues.length})
            </span>
          </div>
        </div>

        {/* Value List */}
        <div className="max-h-48 overflow-y-auto">
          {filteredValues.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No values found
            </div>
          ) : (
            filteredValues.map((item) => (
              <div
                key={item.value}
                className="px-3 py-1.5 cursor-pointer hover:bg-gray-50"
                onClick={() => handleValueToggle(item.value, !selectedValues.has(item.value))}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedValues.has(item.value)}
                    onCheckedChange={(checked) => handleValueToggle(item.value, !!checked)}
                    className="data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
                  />
                  <span className="text-sm text-gray-700 flex-1 truncate">
                    {item.display}
                  </span>
                  <span className="text-xs text-gray-400">
                    {item.count}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with apply hint */}
        {hasActiveFilter && (
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Check className="h-3 w-3 text-[#D4A5A5]" />
              <span>
                {selectedValues.size} value{selectedValues.size !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
