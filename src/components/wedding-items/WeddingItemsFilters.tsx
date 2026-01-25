/**
 * WeddingItemsFilters - Filter dropdowns for wedding items list
 * @feature 013-wedding-items, 031-items-card-table-view
 * @task T033, T034, T035, T036, T037, T038, T006
 */

import { useMemo, useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';

export interface WeddingItemsFilterState {
  search: string;
  category: string;
  supplier: string;
  aggregationMethod: string;
  availabilityStatus: string;
}

export const DEFAULT_FILTERS: WeddingItemsFilterState = {
  search: '',
  category: 'all',
  supplier: 'all',
  aggregationMethod: 'all',
  availabilityStatus: 'all',
};

interface WeddingItemsFiltersProps {
  items: WeddingItemWithQuantities[];
  filters: WeddingItemsFilterState;
  onFiltersChange: (filters: WeddingItemsFilterState) => void;
}

/**
 * Filter controls for wedding items list
 * - Search input with 300ms debounce (T006)
 * - Category dropdown (T035)
 * - Supplier dropdown (T036)
 * - Clear filters button (T038)
 */
export function WeddingItemsFilters({
  items,
  filters,
  onFiltersChange,
}: WeddingItemsFiltersProps) {
  // T006: Local search state for debounce
  const [searchInput, setSearchInput] = useState(filters.search);

  // T006: Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters, onFiltersChange]);

  // Sync local search state when filters change externally (e.g., clear filters)
  useEffect(() => {
    if (filters.search !== searchInput) {
      setSearchInput(filters.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

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

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== 'all' ||
    filters.supplier !== 'all' ||
    filters.aggregationMethod !== 'all' ||
    filters.availabilityStatus !== 'all';

  // T038: Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange(DEFAULT_FILTERS);
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value });
  };

  const handleSupplierChange = (value: string) => {
    onFiltersChange({ ...filters, supplier: value });
  };

  // T030: Aggregation method filter handler
  const handleAggregationMethodChange = (value: string) => {
    onFiltersChange({ ...filters, aggregationMethod: value });
  };

  // T031: Availability status filter handler
  const handleAvailabilityStatusChange = (value: string) => {
    onFiltersChange({ ...filters, availabilityStatus: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* T006: Search input with debounce */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search items..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 w-[200px]"
        />
      </div>

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

      {/* T030: Aggregation method filter dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Method:</label>
        <Select value={filters.aggregationMethod} onValueChange={handleAggregationMethodChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            <SelectItem value="ADD">ADD (Sum)</SelectItem>
            <SelectItem value="MAX">MAX (Maximum)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* T031: Availability status filter dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Status:</label>
        <Select value={filters.availabilityStatus} onValueChange={handleAvailabilityStatusChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="sufficient">Sufficient</SelectItem>
            <SelectItem value="shortage">Shortage</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
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
 * Filters items based on search, category, supplier, aggregation method, and availability status
 */
export function filterWeddingItems(
  items: WeddingItemWithQuantities[],
  filters: WeddingItemsFilterState
): WeddingItemWithQuantities[] {
  return items.filter((item) => {
    // Search filter (description only, case-insensitive)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      if (!item.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Category filter
    if (filters.category !== 'all' && item.category !== filters.category) {
      return false;
    }

    // Supplier filter
    if (filters.supplier !== 'all' && item.supplier_name !== filters.supplier) {
      return false;
    }

    // Aggregation method filter
    if (filters.aggregationMethod !== 'all' && item.aggregation_method !== filters.aggregationMethod) {
      return false;
    }

    // Availability status filter
    if (filters.availabilityStatus !== 'all') {
      const { checkAvailability } = require('@/types/weddingItem');
      const status = checkAvailability(item.total_required, item.number_available);
      if (status.status !== filters.availabilityStatus) {
        return false;
      }
    }

    return true;
  });
}
