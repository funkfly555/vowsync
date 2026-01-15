/**
 * BarOrdersPage - Bar orders list page with card grid layout
 * @feature 012-bar-order-management
 * @task T009, T015, T016
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBarOrders } from '@/hooks/useBarOrders';
import { useBarOrderMutations } from '@/hooks/useBarOrderMutations';
import { BarOrderCard } from '@/components/bar-orders/BarOrderCard';
import { BarOrderEmptyState } from '@/components/bar-orders/BarOrderEmptyState';
import { BarOrderModal } from '@/components/bar-orders/BarOrderModal';
import { DeleteBarOrderDialog } from '@/components/bar-orders/DeleteBarOrderDialog';
import type { BarOrderWithRelations } from '@/types/barOrder';

/**
 * Loading skeleton for bar order cards
 */
function BarOrderCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="pt-3 border-t flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

/**
 * Main bar orders page component
 */
export function BarOrdersPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const { barOrders, isLoading, isError, error } = useBarOrders({
    weddingId: weddingId!,
  });
  const { deleteBarOrder } = useBarOrderMutations({ weddingId: weddingId! });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<BarOrderWithRelations | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<BarOrderWithRelations | null>(null);

  const handleCreateClick = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order: BarOrderWithRelations) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (order: BarOrderWithRelations) => {
    setDeletingOrder(order);
  };

  const handleConfirmDelete = async () => {
    if (deletingOrder) {
      await deleteBarOrder.mutateAsync(deletingOrder.id);
      setDeletingOrder(null);
    }
  };

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error loading bar orders
          </h3>
          <p className="text-muted-foreground">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Bar Orders</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Plan and manage beverage orders for your events
          </p>
        </div>
        {!isLoading && barOrders.length > 0 && (
          <Button onClick={handleCreateClick} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Bar Order
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <BarOrderCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && barOrders.length === 0 && (
        <BarOrderEmptyState onCreateClick={handleCreateClick} />
      )}

      {/* Bar Order Cards Grid */}
      {!isLoading && barOrders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {barOrders.map((order) => (
            <BarOrderCard
              key={order.id}
              order={order}
              weddingId={weddingId!}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteBarOrderDialog
        order={deletingOrder}
        isOpen={!!deletingOrder}
        isDeleting={deleteBarOrder.isPending}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Bar Order Modal */}
      <BarOrderModal
        weddingId={weddingId!}
        isOpen={isModalOpen}
        order={editingOrder}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrder(null);
        }}
      />
    </div>
  );
}
