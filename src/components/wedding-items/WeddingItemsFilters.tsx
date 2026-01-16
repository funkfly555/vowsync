/**
 * WeddingItemsFilters - Filter dropdowns for wedding items list
 * @feature 013-wedding-items
 * @task T033, T034, T035, T036, T037, T038
 */

import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';

export interface WeddingItemsFilterState {
  category: string;
  supplier: string;
}

export const DEFAULT_FILTERS: WeddingItemsFilterState = {
  category: 'all',
  supplier: 'all',
};

interface WeddingItemsFiltersProps {
  items: WeddingItemWithQuantities[];
  filters: WeddingItemsFilterState;
  onFiltersChange: (filters: WeddingItemsFilterState) => void;
}

/**
 * Filter controls for wedding items list
 * - Category dropdown (T035)
 * - Supplier dropdown (T036)
 * - Clear filters button (T038)
 */
export function WeddingItemsFilters({
  items,
  filters,
  onFiltersChange,
}: WeddingItemsFiltersProps) {
  // T033: Extract unique categories from items
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    items.forEach((item) => {
      if (item.category) {
        uniqueCategories.add(item.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [items]);

  // T034: Extract unique suppliers from items
  const suppliers = useMemo(() => {
    const uniqueSuppliers = new Set<string>();
    items.forEach((item) => {
      if (item.supplier_name) {
        uniqueSuppliers.add(item.supplier_name);
      }
    });
    return Array.from(uniqueSuppliers).sort();
  }, [items]);

  const hasActiveFilters = filters.category !== 'all' || filters.supplier !== 'all';

  // T038: Clear all filters
  const handleClearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value });
  };

  const handleSupplierChange = (value: string) => {
    onFiltersChange({ ...filters, supplier: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* T035: Category filter dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Category:</label>
        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* T036: Supplier filter dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Supplier:</label>
        <Select value={filters.supplier} onValueChange={handleSupplierChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All suppliers</SelectItem>
            {suppliers.length === 0 && (
              <SelectItem value="none" disabled>
                No suppliers set
              </SelectItem>
            )}
            {suppliers.map((supplier) => (
              <SelectItem key={supplier} value={supplier}>
                {supplier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* T038: Clear filters button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

/**
 * T037: Client-side filtering logic
 * Filters items based on selected category and supplier
 */
export function filterWeddingItems(
  items: WeddingItemWithQuantities[],
  filters: WeddingItemsFilterState
): WeddingItemWithQuantities[] {
  return items.filter((item) => {
    // Category filter
    if (filters.category !== 'all' && item.category !== filters.category) {
      return false;
    }

    // Supplier filter
    if (filters.supplier !== 'all' && item.supplier_name !== filters.supplier) {
      return false;
    }

    return true;
  });
}
