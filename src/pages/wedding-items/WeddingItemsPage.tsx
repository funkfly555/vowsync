/**
 * WeddingItemsPage - Wedding items list page with full CRUD and filtering
 * @feature 013-wedding-items, 031-items-card-table-view
 * @task T010, T018, T019, T020, T021, T035, T036, T037, T038, T039, T007, T015
 */

import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeddingItems, useEventsForItems } from '@/hooks/useWeddingItems';
import { useWeddingItemMutations } from '@/hooks/useWeddingItemMutations';
import type { ItemEventColumnMeta } from '@/types/item-table';
import { WeddingItemsList } from '@/components/wedding-items/WeddingItemsList';
import { WeddingItemModal } from '@/components/wedding-items/WeddingItemModal';
import { DeleteWeddingItemDialog } from '@/components/wedding-items/DeleteWeddingItemDialog';
import {
  WeddingItemsFilters,
  filterWeddingItems,
  DEFAULT_FILTERS,
  type WeddingItemsFilterState,
} from '@/components/wedding-items/WeddingItemsFilters';
import { WeddingItemsSummary } from '@/components/wedding-items/WeddingItemsSummary';
import { ViewToggle } from '@/components/wedding-items/ViewToggle';
import { BulkActionsBar } from '@/components/wedding-items/BulkActionsBar';
import { BulkDeleteDialog } from '@/components/wedding-items/BulkDeleteDialog';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import type { ItemViewMode } from '@/types/item-table';
import { getItemViewPreference, setItemViewPreference } from '@/lib/item-table-utils';
import { toast } from 'sonner';

/**
 * Main wedding items page component with CRUD operations and filtering
 */
export function WeddingItemsPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const { items, isLoading, isError, error, refetch } = useWeddingItems({
    weddingId: weddingId!,
  });

  // Fetch events for table view event columns
  const { data: eventsData } = useEventsForItems(weddingId!);

  // Transform events to ItemEventColumnMeta format for table columns
  const events: ItemEventColumnMeta[] = useMemo(() => {
    if (!eventsData) return [];
    return eventsData.map((e) => ({
      id: e.id,
      name: e.event_name,
      date: e.event_date,
    }));
  }, [eventsData]);

  // T007: View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ItemViewMode>(() => getItemViewPreference());

  // T007: Selection state (Set<string> for O(1) operations)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filter state (T037)
  const [filters, setFilters] = useState<WeddingItemsFilterState>(DEFAULT_FILTERS);

  // T007: Handle view mode change with localStorage persistence
  const handleViewChange = useCallback((mode: ItemViewMode) => {
    setViewMode(mode);
    setItemViewPreference(mode);
  }, []);

  // T007: Selection handlers
  const handleSelectItem = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((itemIds: string[]) => {
    setSelectedItems(new Set(itemIds));
  }, []);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WeddingItemWithQuantities | null>(null);

  // Delete dialog state
  const [deletingItem, setDeletingItem] = useState<WeddingItemWithQuantities | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // T039: Bulk delete state
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Mutations
  const { deleteItem, updateEventQuantity } = useWeddingItemMutations({ weddingId: weddingId! });

  // T047: Track which item is updating
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // T037: Apply filters to items
  const filteredItems = useMemo(() => {
    return filterWeddingItems(items, filters);
  }, [items, filters]);

  // T039: Check if filters are active
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== 'all' ||
    filters.supplier !== 'all' ||
    filters.aggregationMethod !== 'all' ||
    filters.availabilityStatus !== 'all';

  // Handlers for Create flow (T019)
  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Handlers for Edit flow (T020)
  const handleEditItem = (item: WeddingItemWithQuantities) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Handlers for Delete flow (T021)
  const handleDeleteItem = (item: WeddingItemWithQuantities) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      await deleteItem.mutateAsync(deletingItem.id);
      toast.success('Item deleted successfully');
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeletingItem(null);
    }
  };

  // T039: Clear selection handler
  const handleClearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // T039: Open bulk delete dialog
  const handleOpenBulkDelete = () => {
    setIsBulkDeleteOpen(true);
  };

  // T039: Close bulk delete dialog
  const handleCloseBulkDelete = () => {
    if (!isBulkDeleting) {
      setIsBulkDeleteOpen(false);
    }
  };

  // T040: Bulk delete handler
  const handleConfirmBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    setIsBulkDeleting(true);
    const selectedIds = Array.from(selectedItems);
    let successCount = 0;
    let errorCount = 0;

    for (const itemId of selectedIds) {
      try {
        await deleteItem.mutateAsync(itemId);
        successCount++;
      } catch (error) {
        console.error(`Error deleting item ${itemId}:`, error);
        errorCount++;
      }
    }

    setIsBulkDeleting(false);
    setIsBulkDeleteOpen(false);
    setSelectedItems(new Set());

    if (errorCount === 0) {
      toast.success(`Successfully deleted ${successCount} ${successCount === 1 ? 'item' : 'items'}`);
    } else if (successCount === 0) {
      toast.error(`Failed to delete ${errorCount} ${errorCount === 1 ? 'item' : 'items'}`);
    } else {
      toast.warning(`Deleted ${successCount} ${successCount === 1 ? 'item' : 'items'}, ${errorCount} failed`);
    }
  };

  // T047: Handle inline quantity changes from event breakdown
  const handleQuantityChange = async (itemId: string, eventId: string, quantity: number) => {
    setUpdatingItemId(itemId);
    try {
      await updateEventQuantity.mutateAsync({ itemId, eventId, quantity });
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setIsModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleModalSuccess = () => {
    refetch();
  };

  // Error state
  if (isError) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error loading items
          </h3>
          <p className="text-muted-foreground">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Items</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage furniture, equipment, and supplies for your wedding
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* T015: View Toggle */}
          <ViewToggle
            activeView={viewMode}
            onViewChange={handleViewChange}
          />
          <Button onClick={handleAddItem} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* T042, T044, T045: Summary Statistics - reflects filtered items */}
      <WeddingItemsSummary items={filteredItems} />

      {/* Filters (T035, T036, T038) */}
      {items.length > 0 && (
        <div className="space-y-3">
          <WeddingItemsFilters
            items={items}
            filters={filters}
            onFiltersChange={setFilters}
          />

          {/* T039: Item count display */}
          <div className="text-sm text-muted-foreground">
            {hasActiveFilters ? (
              <>
                Showing {filteredItems.length} of {items.length} items
              </>
            ) : (
              <>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </>
            )}
          </div>
        </div>
      )}

      {/* Items List (T018, T014) - Table view with inline editing like Guest table */}
      <WeddingItemsList
        items={filteredItems}
        events={events}
        weddingId={weddingId!}
        viewMode={viewMode}
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
        onQuantityChange={handleQuantityChange}
        updatingItemId={updatingItemId}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* Create/Edit Modal (T019, T020) */}
      <WeddingItemModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        weddingId={weddingId!}
        itemId={editingItem?.id}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog (T021) */}
      <DeleteWeddingItemDialog
        item={deletingItem}
        isOpen={!!deletingItem}
        isDeleting={isDeleting}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      {/* T039: Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedItems.size}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleOpenBulkDelete}
      />

      {/* T038, T040: Bulk Delete Dialog */}
      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        itemCount={selectedItems.size}
        isDeleting={isBulkDeleting}
        onClose={handleCloseBulkDelete}
        onConfirm={handleConfirmBulkDelete}
      />
    </div>
  );
}
