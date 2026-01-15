/**
 * BarOrderDetailPage - Detail page for viewing/editing a bar order
 * @feature 012-bar-order-management
 * @task T024, T030, T031
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Users,
  Wine,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBarOrder } from '@/hooks/useBarOrder';
import { useBarOrderMutations } from '@/hooks/useBarOrderMutations';
import { BarOrderStatusBadge } from '@/components/bar-orders/BarOrderStatusBadge';
import { BarOrderItemsTable } from '@/components/bar-orders/BarOrderItemsTable';
import { BarOrderItemModal } from '@/components/bar-orders/BarOrderItemModal';
import { BarOrderModal } from '@/components/bar-orders/BarOrderModal';
import { BarOrderSummary } from '@/components/bar-orders/BarOrderSummary';
import { PercentageWarning } from '@/components/bar-orders/PercentageWarning';
import { DeleteBarOrderDialog } from '@/components/bar-orders/DeleteBarOrderDialog';
import type { BarOrderItem } from '@/types/barOrder';
import { formatDuration } from '@/lib/barOrderCalculations';

/**
 * Loading skeleton for detail page
 */
function DetailPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>

      {/* Table Skeleton */}
      <Skeleton className="h-64" />
    </div>
  );
}

/**
 * Bar order detail page with items management
 */
export function BarOrderDetailPage() {
  const { weddingId, orderId } = useParams<{
    weddingId: string;
    orderId: string;
  }>();
  const navigate = useNavigate();

  const { barOrder, isLoading, isError, error } = useBarOrder(orderId);
  const { deleteBarOrder, deleteBarOrderItem } = useBarOrderMutations({
    weddingId: weddingId!,
  });

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BarOrderItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleBack = () => {
    navigate(`/weddings/${weddingId}/bar-orders`);
  };

  const handleEditOrder = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteOrder = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteOrder = async () => {
    if (barOrder) {
      await deleteBarOrder.mutateAsync(barOrder.id);
      navigate(`/weddings/${weddingId}/bar-orders`);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: BarOrderItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setDeletingItemId(itemId);
  };

  const handleConfirmDeleteItem = async () => {
    if (deletingItemId && barOrder) {
      await deleteBarOrderItem.mutateAsync({
        orderId: barOrder.id,
        itemId: deletingItemId,
      });
      setDeletingItemId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  // Error state
  if (isError || !barOrder) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bar Orders
        </Button>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            {isError ? 'Error loading bar order' : 'Bar order not found'}
          </h3>
          <p className="text-muted-foreground">
            {error?.message || 'The requested bar order could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 md:gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Back to bar orders">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <h1 className="text-xl md:text-2xl font-bold">{barOrder.name}</h1>
              <BarOrderStatusBadge status={barOrder.status} showIcon />
            </div>
            {barOrder.event && (
              <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm md:text-base">
                <Calendar className="h-4 w-4" />
                {barOrder.event.name}
              </p>
            )}
            {barOrder.vendor && (
              <p className="text-sm text-muted-foreground mt-1">
                Vendor: {barOrder.vendor.business_name}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-10 sm:ml-0">
          <Button variant="outline" onClick={handleEditOrder} size="sm" className="md:size-default">
            <Pencil className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Edit Order</span>
            <span className="sm:hidden">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive md:size-default"
            onClick={handleDeleteOrder}
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Users className="h-4 w-4" />
            Guests
          </div>
          <p className="text-2xl font-semibold">{barOrder.guest_count_adults}</p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="h-4 w-4" />
            Duration
          </div>
          <p className="text-2xl font-semibold">
            {formatDuration(barOrder.event_duration_hours)}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Wine className="h-4 w-4" />
            Servings/Person
          </div>
          <p className="text-2xl font-semibold">
            {barOrder.total_servings_per_person.toFixed(1)}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-muted-foreground text-sm mb-1">
            Consumption Model
          </div>
          <p className="text-sm">
            {barOrder.first_hours}h @ {barOrder.first_hours_drinks_per_hour}/hr +{' '}
            {Math.max(barOrder.event_duration_hours - barOrder.first_hours, 0).toFixed(1)}h @{' '}
            {barOrder.remaining_hours_drinks_per_hour}/hr
          </p>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Beverage Items</h2>
          <Button onClick={handleAddItem} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Percentage Warning */}
        {barOrder.items.length > 0 && (
          <PercentageWarning items={barOrder.items} />
        )}

        {/* Items Table */}
        <BarOrderItemsTable
          items={barOrder.items}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />

        {/* Summary */}
        {barOrder.items.length > 0 && (
          <BarOrderSummary items={barOrder.items} />
        )}
      </div>

      {/* Notes */}
      {barOrder.notes && (
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {barOrder.notes}
          </p>
        </div>
      )}

      {/* Edit Order Modal */}
      <BarOrderModal
        weddingId={weddingId!}
        isOpen={isEditModalOpen}
        order={barOrder}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Item Modal */}
      <BarOrderItemModal
        orderId={barOrder.id}
        weddingId={weddingId!}
        totalServingsPerPerson={barOrder.total_servings_per_person}
        guestCount={barOrder.guest_count_adults}
        isOpen={isItemModalOpen}
        item={editingItem}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
      />

      {/* Delete Order Dialog */}
      <DeleteBarOrderDialog
        order={barOrder}
        isOpen={isDeleteDialogOpen}
        isDeleting={deleteBarOrder.isPending}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteOrder}
      />

      {/* Delete Item Confirmation */}
      {deletingItemId && (
        <DeleteItemDialog
          isOpen={!!deletingItemId}
          isDeleting={deleteBarOrderItem.isPending}
          onClose={() => setDeletingItemId(null)}
          onConfirm={handleConfirmDeleteItem}
        />
      )}
    </div>
  );
}

/**
 * Simple delete item confirmation dialog
 */
function DeleteItemDialog({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center bg-black/50`}
    >
      <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Delete Item</h3>
        <p className="text-muted-foreground mb-4">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
