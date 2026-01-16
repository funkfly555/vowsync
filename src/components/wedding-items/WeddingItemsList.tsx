/**
 * WeddingItemsList - List view of wedding items with cards
 * @feature 013-wedding-items
 * @task T017
 */

import { Package, Plus, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { WeddingItemCard } from './WeddingItemCard';

interface WeddingItemsListProps {
  items: WeddingItemWithQuantities[];
  onAddItem: () => void;
  onEditItem: (item: WeddingItemWithQuantities) => void;
  onDeleteItem: (item: WeddingItemWithQuantities) => void;
  onQuantityChange?: (itemId: string, eventId: string, quantity: number) => void;
  updatingItemId?: string | null;
  isLoading: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

/**
 * Loading skeleton for the items list
 */
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

/**
 * Empty state when no items exist
 */
interface EmptyStateProps {
  onAddItem: () => void;
}

function EmptyState({ onAddItem }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        Start tracking your wedding items like tables, chairs, linens, and decorations.
      </p>
      <Button onClick={onAddItem}>
        <Plus className="h-4 w-4 mr-2" />
        Add First Item
      </Button>
    </div>
  );
}

/**
 * T050: Empty state when no items match filters
 */
interface NoResultsStateProps {
  onClearFilters?: () => void;
}

function NoResultsState({ onClearFilters }: NoResultsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <SearchX className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching items</h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        No items match your current filters. Try adjusting or clearing your filters.
      </p>
      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}

/**
 * Main list component displaying wedding items in a responsive grid
 */
export function WeddingItemsList({
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onQuantityChange,
  updatingItemId,
  isLoading,
  hasActiveFilters = false,
  onClearFilters,
}: WeddingItemsListProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // T050: Different empty states for no items vs no filter matches
  if (items.length === 0) {
    if (hasActiveFilters) {
      return <NoResultsState onClearFilters={onClearFilters} />;
    }
    return <EmptyState onAddItem={onAddItem} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {items.map((item) => (
        <WeddingItemCard
          key={item.id}
          item={item}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
          onQuantityChange={onQuantityChange}
          isUpdatingQuantity={updatingItemId === item.id}
        />
      ))}
    </div>
  );
}
