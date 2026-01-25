/**
 * WeddingItemsList - List view of wedding items with cards or table
 * @feature 013-wedding-items, 031-items-card-table-view
 * @task T017, T014, T019
 */

import { Package, Plus, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import type { ItemViewMode, ItemEventColumnMeta } from '@/types/item-table';
import { ItemCard } from './ItemCard';
import { ItemTableView } from './table/ItemTableView';

interface WeddingItemsListProps {
  items: WeddingItemWithQuantities[];
  events?: ItemEventColumnMeta[];
  weddingId: string;
  viewMode?: ItemViewMode;
  selectedItems?: Set<string>;
  onSelectItem?: (id: string, selected: boolean) => void;
  onSelectAll?: (itemIds: string[]) => void;
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-20 border-b border-gray-200 animate-pulse bg-gray-50" />
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
 * Main list component displaying wedding items
 * Card view: Vertical list with expandable cards (like Guests)
 * Table view: Horizontal scrollable table with sorting and filtering
 */
export function WeddingItemsList({
  items,
  events = [],
  weddingId,
  viewMode = 'card',
  selectedItems = new Set(),
  onSelectItem,
  onSelectAll,
  onAddItem,
  onEditItem,
  onDeleteItem,
  // Card view uses inline editing with auto-save, so these are only for table view
  onQuantityChange: _onQuantityChange,
  updatingItemId: _updatingItemId,
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

  // T014: Table view - FLAT spreadsheet layout with inline editing (like Guest table)
  if (viewMode === 'table' && onSelectItem && onSelectAll) {
    return (
      <ItemTableView
        items={items}
        events={events}
        weddingId={weddingId}
        selectedItems={selectedItems}
        onSelectItem={onSelectItem}
        onSelectAll={onSelectAll}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
      />
    );
  }

  // T019: Card view with expandable ItemCard components
  // Vertical list layout (like GuestsPage) - NOT grid
  // Adapter function: toggle selection based on current state
  const handleToggleSelect = (itemId: string) => {
    if (onSelectItem) {
      const isCurrentlySelected = selectedItems.has(itemId);
      onSelectItem(itemId, !isCurrentlySelected);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          isSelected={selectedItems.has(item.id)}
          onToggleSelect={handleToggleSelect}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  );
}
