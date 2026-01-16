/**
 * WeddingItemsPage - Wedding items list page with full CRUD and filtering
 * @feature 013-wedding-items
 * @task T010, T018, T019, T020, T021, T035, T036, T037, T038, T039
 */

import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeddingItems } from '@/hooks/useWeddingItems';
import { useWeddingItemMutations } from '@/hooks/useWeddingItemMutations';
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
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { toast } from 'sonner';

/**
 * Main wedding items page component with CRUD operations and filtering
 */
export function WeddingItemsPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const { items, isLoading, isError, error, refetch } = useWeddingItems({
    weddingId: weddingId!,
  });

  // Filter state (T037)
  const [filters, setFilters] = useState<WeddingItemsFilterState>(DEFAULT_FILTERS);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WeddingItemWithQuantities | null>(null);

  // Delete dialog state
  const [deletingItem, setDeletingItem] = useState<WeddingItemWithQuantities | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mutations
  const { deleteItem, updateEventQuantity } = useWeddingItemMutations({ weddingId: weddingId! });

  // T047: Track which item is updating
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // T037: Apply filters to items
  const filteredItems = useMemo(() => {
    return filterWeddingItems(items, filters);
  }, [items, filters]);

  // T039: Check if filters are active
  const hasActiveFilters = filters.category !== 'all' || filters.supplier !== 'all';

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
        <Button onClick={handleAddItem} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* T042: Summary Statistics */}
      <WeddingItemsSummary items={items} />

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

      {/* Items List (T018) */}
      <WeddingItemsList
        items={filteredItems}
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
    </div>
  );
}
