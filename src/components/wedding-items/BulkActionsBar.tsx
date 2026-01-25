/**
 * BulkActionsBar - Shows selection count and bulk action buttons
 * @feature 031-items-card-table-view
 * @task T034
 */

import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
}

/**
 * Floating bar showing selection count with bulk action buttons
 * AC6.3: Shows "X items selected" with action buttons
 */
export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
}: BulkActionsBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="sticky bottom-4 z-20 flex justify-center">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>

        <div className="h-4 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteSelected}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
