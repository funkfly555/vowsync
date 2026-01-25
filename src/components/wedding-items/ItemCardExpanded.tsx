/**
 * ItemCardExpanded - Expanded view wrapper with CSS transition animation
 * Contains the 4-tab interface with form content and auto-save status
 * Pattern matches GuestCardExpanded.tsx exactly
 * @feature 031-items-card-table-view
 * @task T017, T050
 */

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, Check, AlertCircle, Cloud } from 'lucide-react';
import { ItemTabs, type ItemTabName } from './ItemTabs';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import type { SaveStatus } from './ItemCard';

interface ItemCardExpandedProps {
  item: WeddingItemWithQuantities;
  isExpanded: boolean;
  saveStatus: SaveStatus;
  onDelete: () => void;
  children: (activeTab: ItemTabName) => ReactNode;
}

/**
 * Expanded view with CSS transition animation and tabbed layout
 * Children pattern allows parent to provide tab content with FormProvider context
 */
export function ItemCardExpanded({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  item: _item,
  isExpanded,
  saveStatus,
  onDelete,
  children,
}: ItemCardExpandedProps) {
  const [activeTab, setActiveTab] = useState<ItemTabName>('details');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        isExpanded ? 'max-h-[2000px] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
      )}
    >
      <div className="border-t border-gray-200">
        {/* Tab navigation */}
        <ItemTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content */}
        <div>
          {children(activeTab)}
        </div>

        {/* Footer with auto-save status and delete button */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t border-gray-200">
          <AutoSaveIndicator status={saveStatus} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Auto-save status indicator component
 */
function AutoSaveIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-[#D4A5A5]" />
          <span>Saving...</span>
        </div>
      );
    case 'saved':
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          <span>All changes saved</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to save</span>
        </div>
      );
    case 'idle':
    default:
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Cloud className="h-4 w-4" />
          <span>Auto-save enabled</span>
        </div>
      );
  }
}
