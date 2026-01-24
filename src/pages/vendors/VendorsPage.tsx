/**
 * VendorsPage Component
 * @feature 008-vendor-management, 027-vendor-view-toggle, 028-vendor-card-expandable
 * @task T018
 *
 * Main vendor list page with header, view toggle, and add button
 * Enhanced with expandable card functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VendorList } from '@/components/vendors/VendorList';
import { VendorTableView } from '@/components/vendors/table';
import { ViewToggle } from '@/components/vendors/ViewToggle';
import { VendorModal } from '@/components/vendors/VendorModal';
import { DeleteVendorDialog } from '@/components/vendors/DeleteVendorDialog';
import { useVendors } from '@/hooks/useVendors';
import { VendorDisplay, VendorFilters, DEFAULT_VENDOR_FILTERS } from '@/types/vendor';
import type { VendorViewMode, VendorFiltersState } from '@/types/vendor-table';
import {
  getVendorViewPreference,
  setVendorViewPreference,
} from '@/lib/vendor-table-utils';

export function VendorsPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const [filters, setFilters] = useState<VendorFilters>(DEFAULT_VENDOR_FILTERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorDisplay | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<VendorDisplay | null>(null);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<VendorViewMode>(() => getVendorViewPreference());

  // Selection state (shared between Card and Table views)
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());

  // Expanded cards state for card view
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { vendors, isLoading, isError, error, refetch } = useVendors({
    weddingId: weddingId || '',
    filters,
  });

  // Persist view preference to localStorage
  useEffect(() => {
    setVendorViewPreference(viewMode);
  }, [viewMode]);

  // Convert VendorFilters to VendorFiltersState for table view
  const tableFilters: VendorFiltersState = {
    search: filters.search,
    vendorType: filters.vendorType,
    status: 'all', // VendorFilters doesn't have status, default to 'all'
    contractStatus: filters.contractStatus,
  };

  // Handle selection toggle
  const handleToggleSelect = useCallback((vendorId: string) => {
    setSelectedVendors((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) {
        next.delete(vendorId);
      } else {
        next.add(vendorId);
      }
      return next;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    setSelectedVendors((prev) => {
      // If all are selected, deselect all
      if (vendors.length > 0 && vendors.every((v) => prev.has(v.id))) {
        return new Set();
      }
      // Otherwise, select all
      return new Set(vendors.map((v) => v.id));
    });
  }, [vendors]);

  // Handle expand/collapse individual card
  const handleToggleExpand = useCallback((vendorId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) {
        next.delete(vendorId);
      } else {
        next.add(vendorId);
      }
      return next;
    });
  }, []);

  // Handle expand all cards
  const handleExpandAll = useCallback(() => {
    setExpandedCards(new Set(vendors.map((v) => v.id)));
  }, [vendors]);

  // Handle collapse all cards
  const handleCollapseAll = useCallback(() => {
    setExpandedCards(new Set());
  }, []);

  const handleAddVendor = () => {
    setEditingVendor(null);
    setIsModalOpen(true);
  };

  const handleDeleteVendor = (vendor: VendorDisplay) => {
    setDeletingVendor(vendor);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
    refetch();
  };

  const handleDeleteClose = () => {
    setDeletingVendor(null);
  };

  const handleDeleteSuccess = () => {
    setDeletingVendor(null);
    refetch();
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading vendors
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your wedding vendors and track contracts
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Expand/Collapse All buttons - only show in card view */}
          {viewMode === 'card' && vendors.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                disabled={expandedCards.size === vendors.length}
              >
                <ChevronsUpDown className="h-4 w-4 mr-1" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCollapseAll}
                disabled={expandedCards.size === 0}
              >
                <ChevronsDownUp className="h-4 w-4 mr-1" />
                Collapse All
              </Button>
            </div>
          )}
          <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
          <Button onClick={handleAddVendor}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Conditional view rendering */}
      {viewMode === 'card' ? (
        <VendorList
          vendors={vendors}
          weddingId={weddingId || ''}
          filters={filters}
          onFiltersChange={setFilters}
          onAddVendor={handleAddVendor}
          onDeleteVendor={handleDeleteVendor}
          isLoading={isLoading}
          expandedCards={expandedCards}
          selectedVendors={selectedVendors}
          onToggleExpand={handleToggleExpand}
          onToggleSelect={handleToggleSelect}
        />
      ) : (
        <VendorTableView
          weddingId={weddingId || ''}
          filters={tableFilters}
          selectedVendors={selectedVendors}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      )}

      {/* Add/Edit modal */}
      <VendorModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        vendor={editingVendor}
        weddingId={weddingId || ''}
      />

      {/* Delete confirmation dialog */}
      <DeleteVendorDialog
        open={!!deletingVendor}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
        vendor={deletingVendor}
      />
    </div>
  );
}
