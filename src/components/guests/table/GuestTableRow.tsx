/**
 * GuestTableRow - Table row component with cell rendering and inline editing
 * @feature 026-guest-view-toggle
 */

import { memo, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { GuestTableCell } from './GuestTableCell';
import { useUpdateGuestCell } from '@/hooks/useGuestTableData';
import type { TableColumnDef, GuestTableRowData, MealOptionLookup, CellEditPayload } from '@/types/guest-table';

interface GuestTableRowProps {
  row: GuestTableRowData;
  columns: TableColumnDef[];
  mealOptions: MealOptionLookup;
  weddingId: string;
  isSelected?: boolean;
  onSelect?: (id: string) => void; // Reserved for future row selection
  className?: string;
}

/**
 * Renders a single table row with all cells and inline editing capability
 * Memoized for performance with large datasets
 */
export const GuestTableRow = memo(function GuestTableRow({
  row,
  columns,
  mealOptions,
  weddingId,
  isSelected = false,
  onSelect,
  className,
}: GuestTableRowProps) {
  // Currently editing cell
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);

  // Pending changes (saved on blur/Enter, discarded on Escape)
  const pendingChangesRef = useRef<Map<string, CellEditPayload>>(new Map());

  // Mutation hook for saving changes
  const updateCell = useUpdateGuestCell();

  // Parse column field to determine if it's an event attendance field
  const parseColumnField = useCallback((column: TableColumnDef): {
    field: string;
    eventId?: string;
    attendanceField?: 'attending' | 'shuttle_to_event' | 'shuttle_from_event';
  } => {
    // Event attendance fields have format: eventAttendance.{eventId}.{field}
    if (column.field.startsWith('eventAttendance.')) {
      const parts = column.field.split('.');
      return {
        field: column.field,
        eventId: parts[1],
        attendanceField: parts[2] as 'attending' | 'shuttle_to_event' | 'shuttle_from_event',
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

  // Handle cell value change - store pending changes (save on blur/Enter)
  const handleValueChange = useCallback(
    (columnId: string, value: unknown) => {
      const column = columns.find((c) => c.id === columnId);
      if (!column) return;

      const fieldInfo = parseColumnField(column);

      const payload: CellEditPayload = {
        guestId: row.id,
        weddingId,
        value: value as string | number | boolean | null,
        ...fieldInfo,
      };

      // For boolean fields (checkboxes), save immediately
      if (column.type === 'boolean') {
        updateCell.mutate(payload);
        return;
      }

      // For shuttle-toggle, save immediately and update BOTH shuttle_to_event AND shuttle_from_event
      // This matches the card view behavior in EventsShuttlesTab
      if (column.type === 'shuttle-toggle' && column.eventId) {
        const shuttleValue = value as string | null;
        // Update shuttle_to_event
        updateCell.mutate({
          guestId: row.id,
          weddingId,
          field: `eventAttendance.${column.eventId}.shuttle_to_event`,
          value: shuttleValue,
          eventId: column.eventId,
          attendanceField: 'shuttle_to_event',
        });
        // Update shuttle_from_event
        updateCell.mutate({
          guestId: row.id,
          weddingId,
          field: `eventAttendance.${column.eventId}.shuttle_from_event`,
          value: shuttleValue,
          eventId: column.eventId,
          attendanceField: 'shuttle_from_event',
        });
        return;
      }

      // For other fields, store pending change (will be saved on blur/Enter)
      pendingChangesRef.current.set(columnId, payload);
    },
    [columns, parseColumnField, row.id, weddingId, updateCell]
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

  return (
    <tr
      className={cn(
        'border-b border-[#E8E8E8] transition-colors',
        isSelected ? 'bg-[#D4A5A5]/10' : 'hover:bg-gray-50',
        className
      )}
    >
      {/* Checkbox cell - sticky */}
      {onSelect && (
        <td
          className={cn(
            'w-12 min-w-12 px-2 py-2 border-r border-[#E8E8E8] sticky left-0 z-10',
            isSelected ? 'bg-[#D4A5A5]/10' : 'bg-white'
          )}
        >
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(row.id)}
              className="h-4 w-4 data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
              aria-label={`Select ${row.name}`}
            />
          </div>
        </td>
      )}
      {columns.map((column) => (
        <GuestTableCell
          key={column.id}
          column={column}
          row={row}
          mealOptions={mealOptions}
          isEditing={editingColumnId === column.id}
          onStartEdit={() => handleStartEdit(column.id)}
          onEndEdit={handleEndEdit}
          onValueChange={handleValueChange}
        />
      ))}
    </tr>
  );
});
