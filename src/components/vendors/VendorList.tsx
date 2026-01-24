/**
 * VendorList Component
 * @feature 008-vendor-management, 028-vendor-card-expandable
 * @task T017, T041, T046-T057
 *
 * Vertical list display with expandable cards, search, and filters
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { VendorDisplay, VendorFilters as VendorFiltersType, DEFAULT_VENDOR_FILTERS } from '@/types/vendor';
import { useDebounce } from '@/hooks/useDebounce';
import { VendorCard } from './VendorCard';
import { VendorEmptyState } from './VendorEmptyState';
import { VendorFilters } from './VendorFilters';

interface VendorListProps {
  vendors: VendorDisplay[];
  weddingId: string;
  filters: VendorFiltersType;
  onFiltersChange: (filters: VendorFiltersType) => void;
  onAddVendor: () => void;
  onDeleteVendor: (vendor: VendorDisplay) => void;
  isLoading: boolean;
  // Expandable card props
  expandedCards: Set<string>;
  selectedVendors: Set<string>;
  onToggleExpand: (vendorId: string) => void;
  onToggleSelect: (vendorId: string) => void;
}

export function VendorList({
  vendors,
  weddingId,
  filters,
  onFiltersChange,
  onAddVendor,
  onDeleteVendor,
  isLoading,
  expandedCards,
  selectedVendors,
  onToggleExpand,
  onToggleSelect,
}: VendorListProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange(DEFAULT_VENDOR_FILTERS);
  };

  const hasFilters =
    filters.search !== '' ||
    filters.vendorType !== 'all' ||
    filters.contractStatus !== 'all' ||
    filters.paymentStatus !== 'all';

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Search skeleton */}
        <div className="relative">
          <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
        </div>

        {/* Cards skeleton - vertical list for expandable cards */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by company or contact name..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <VendorFilters filters={filters} onFiltersChange={onFiltersChange} />
      </div>

      {/* Vendor list or empty state */}
      {vendors.length === 0 ? (
        <VendorEmptyState
          hasFilters={hasFilters}
          onAddVendor={onAddVendor}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              weddingId={weddingId}
              isExpanded={expandedCards.has(vendor.id)}
              isSelected={selectedVendors.has(vendor.id)}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              onDelete={() => onDeleteVendor(vendor)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
