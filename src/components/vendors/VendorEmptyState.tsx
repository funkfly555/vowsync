/**
 * VendorEmptyState Component
 * @feature 008-vendor-management
 * @task T016
 *
 * Empty state display for vendor list (FR-005)
 */

import { Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorEmptyStateProps {
  hasFilters: boolean;
  onAddVendor: () => void;
  onClearFilters: () => void;
}

export function VendorEmptyState({ hasFilters, onAddVendor, onClearFilters }: VendorEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No vendors found
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          No vendors match your current filters. Try adjusting your search or filter criteria.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No vendors yet
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        Get started by adding your first vendor. Track caterers, photographers, florists, and more.
      </p>
      <Button onClick={onAddVendor}>
        Add Your First Vendor
      </Button>
    </div>
  );
}
