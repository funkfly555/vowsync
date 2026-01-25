/**
 * ItemTableRow - FLAT table row component with inline editing
 * Follows GuestTableRow pattern for full inline editing support
 * @feature 031-items-card-table-view
 */

import { memo, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ItemTableRow as ItemTableRowType, ItemTableColumnDef, ItemCellEditPayload } from '@/types/item-table';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { ItemTableCell } from './ItemTableCell';
import { useUpdateItemCell } from '@/hooks/useUpdateItemCell';

interface ItemTableRowProps {
  row: ItemTableRowType;
  columns: ItemTableColumnDef[];
  weddingId: string;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onEdit: (item: WeddingItemWithQuantities) => void;
  onDelete: (item: WeddingItemWithQuantities) => void;
}

/**
 * Renders a FLAT table row with inline editing capability
 * Memoized for performance with large datasets
 */
export const ItemTableRow = memo(function ItemTableRow({
  row,
  columns,
  weddingId,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: ItemTableRowProps) {
  // Currently editing cell
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);

  // Pending changes (saved on blur/Enter, discarded on Escape)
  const pendingChangesRef = useRef<Map<string, ItemCellEditPayload>>(new Map());

  // Mutation hook for saving changes
  const updateCell = useUpdateItemCell();

  // Parse column field to determine if it's an event quantity field
  const parseColumnField = useCallback((column: ItemTableColumnDef): {
    field: string;
    eventId?: string;
  } => {
    // Event quantity fields have format: eventQuantityMap.{eventId}
    if (column.field.startsWith('eventQuantityMap.')) {
      const eventId = column.field.split('.')[1];
      return {
        field: column.field,
        eventId,
      };
    }
    return {
      field: column.field,
    };
  }, []);

  // Save pending changes
  const savePendingChanges = useCallback(() => {
    pendingChangesRef.current.forEach((payload) => {
      updateCell.mutate(payload);
    });
    pendingChangesRef.current.clear();
  }, [updateCell]);

  // Handle cell value change
  const handleValueChange = useCallback(
    (columnId: string, value: unknown) => {
      const column = columns.find((c) => c.id === columnId);
      if (!column) return;

      const fieldInfo = parseColumnField(column);

      const payload: ItemCellEditPayload = {
        itemId: row.id,
        weddingId,
        field: fieldInfo.field,
        value: value as string | number | boolean | null,
        eventId: fieldInfo.eventId,
      };

      // Store pending change (will be saved on blur/Enter)
      pendingChangesRef.current.set(columnId, payload);
    },
    [columns, parseColumnField, row.id, weddingId]
  );

  // Start editing a cell
  const handleStartEdit = useCallback((columnId: string) => {
    setEditingColumnId(columnId);
  }, []);

  // End editing - save or discard pending changes
  const handleEndEdit = useCallback((cancelled?: boolean) => {
    setEditingColumnId(null);

    if (cancelled) {
      // Discard pending changes on Escape
      pendingChangesRef.current.clear();
    } else {
      // Save pending changes on blur or Enter
      savePendingChanges();
    }
  }, [savePendingChanges]);

  const handleCheckboxChange = (checked: boolean) => {
    onSelect(row.id, checked);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(row._original);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(row._original);
  };

  // Double-click to edit (opens modal)
  const handleDoubleClick = () => {
    onEdit(row._original);
  };

  return (
    <tr
      className={cn(
        'border-b border-gray-200 transition-colors',
        isSelected ? 'bg-[#D4A5A5]/10' : 'hover:bg-gray-50'
      )}
      onDoubleClick={handleDoubleClick}
    >
      {columns.map((column) => {
        // Checkbox column
        if (column.type === 'checkbox') {
          return (
            <td
              key={column.id}
              className={cn(
                'px-3 py-2 text-center sticky left-0 z-10',
                isSelected ? 'bg-[#D4A5A5]/10' : 'bg-white'
              )}
              style={{ width: column.width, minWidth: column.width }}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleCheckboxChange}
                className="data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
                aria-label={`Select ${row.description}`}
              />
            </td>
          );
        }

        // Actions column
        if (column.type === 'actions') {
          return (
            <td
              key={column.id}
              className="px-3 py-2"
              style={{ width: column.width, minWidth: column.width }}
            >
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleEdit}
                  aria-label={`Edit ${row.description}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-red-600"
                  onClick={handleDelete}
                  aria-label={`Delete ${row.description}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </td>
          );
        }

        // All other columns - render via ItemTableCell with inline editing
        return (
          <ItemTableCell
            key={column.id}
            row={row}
            column={column}
            isEditing={editingColumnId === column.id}
            onStartEdit={() => handleStartEdit(column.id)}
            onEndEdit={handleEndEdit}
            onValueChange={handleValueChange}
          />
        );
      })}
    </tr>
  );
});
