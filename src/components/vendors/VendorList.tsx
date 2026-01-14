/**
 * VendorList Component
 * @feature 008-vendor-management
 * @task T017, T041
 *
 * Responsive grid display with search and filters (FR-001, FR-003, FR-004)
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
  onEditVendor: (vendor: VendorDisplay) => void;
  onDeleteVendor: (vendor: VendorDisplay) => void;
  isLoading: boolean;
}

export function VendorList({
  vendors,
  weddingId,
  filters,
  onFiltersChange,
  onAddVendor,
  onEditVendor,
  onDeleteVendor,
  isLoading,
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

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
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

      {/* Vendor grid or empty state */}
      {vendors.length === 0 ? (
        <VendorEmptyState
          hasFilters={hasFilters}
          onAddVendor={onAddVendor}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              weddingId={weddingId}
              onEdit={onEditVendor}
              onDelete={onDeleteVendor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
