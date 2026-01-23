/**
 * VendorTableRow - Individual row renderer with selection and cell management
 * @feature 027-vendor-view-toggle
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { VendorTableCell } from './VendorTableCell';
import { useUpdateVendorCell } from '@/hooks/useVendorTableData';
import type { VendorTableColumnDef, VendorTableRow as VendorTableRowType } from '@/types/vendor-table';
import type { Vendor } from '@/types/vendor';
import { toast } from 'sonner';

interface VendorTableRowProps {
  row: VendorTableRowType;
  columns: VendorTableColumnDef[];
  weddingId: string;
  isSelected?: boolean;
  onToggleSelect?: (vendorId: string) => void;
}

/**
 * Table row with selection checkbox and editable cells
 */
export const VendorTableRow = memo(function VendorTableRow({
  row,
  columns,
  weddingId,
  isSelected = false,
  onToggleSelect,
}: VendorTableRowProps) {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({});
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateVendorCell = useUpdateVendorCell();

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle starting edit mode for a cell
  const handleStartEdit = useCallback((columnId: string) => {
    setEditingColumnId(columnId);
  }, []);

  // Handle ending edit mode
  const handleEndEdit = useCallback((cancelled?: boolean) => {
    if (cancelled) {
      // Clear pending changes for this cell
      setPendingChanges((prev) => {
        const next = { ...prev };
        if (editingColumnId) {
          delete next[editingColumnId];
        }
        return next;
      });
    }
    setEditingColumnId(null);
  }, [editingColumnId]);

  // Handle value change with debounced auto-save
  const handleValueChange = useCallback(
    (columnId: string, value: unknown) => {
      // Find column to get field name
      const column = columns.find((c) => c.id === columnId);
      if (!column) return;

      // For boolean fields (checkbox), save immediately
      if (column.type === 'boolean') {
        updateVendorCell.mutate(
          {
            vendorId: row.id,
            weddingId,
            field: column.field as keyof Vendor,
            value: value as string | boolean | number | null,
          },
          {
            onSuccess: () => {
              toast.success('Saved');
            },
          }
        );
        return;
      }

      // For other fields, track pending changes
      setPendingChanges((prev) => ({
        ...prev,
        [columnId]: value,
      }));

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer (500ms per FR-014)
      debounceTimerRef.current = setTimeout(() => {
        updateVendorCell.mutate(
          {
            vendorId: row.id,
            weddingId,
            field: column.field as keyof Vendor,
            value: value as string | boolean | number | null,
          },
          {
            onSuccess: () => {
              // Clear pending change
              setPendingChanges((prev) => {
                const next = { ...prev };
                delete next[columnId];
                return next;
              });
              toast.success('Saved');
            },
            onError: () => {
              // Keep pending change to show error state
            },
          }
        );
      }, 500);
    },
    [columns, row.id, weddingId, updateVendorCell]
  );

  // Handle selection toggle
  const handleToggleSelect = useCallback(() => {
    onToggleSelect?.(row.id);
  }, [onToggleSelect, row.id]);

  return (
    <tr
      className={cn(
        'border-b border-[#E8E8E8] transition-colors',
        isSelected ? 'bg-[#D4A5A5]/10' : 'hover:bg-gray-50'
      )}
    >
      {/* Selection checkbox - sticky */}
      <td className="sticky left-0 z-10 bg-white px-4 py-2 border-r border-gray-100">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleToggleSelect}
          className="data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
          aria-label={`Select ${row.company_name}`}
        />
      </td>

      {/* Company name - sticky second column */}
      <td
        className={cn(
          'sticky left-[52px] z-10 bg-white px-4 py-2 text-sm font-medium border-r border-gray-100',
          'cursor-pointer hover:bg-gray-50',
          isSelected && 'bg-[#D4A5A5]/10'
        )}
        style={{ minWidth: 200 }}
        onClick={() => handleStartEdit('company_name')}
      >
        <VendorTableCell
          column={columns.find((c) => c.id === 'company_name')!}
          row={row}
          isEditing={editingColumnId === 'company_name'}
          onStartEdit={() => handleStartEdit('company_name')}
          onEndEdit={handleEndEdit}
          onValueChange={handleValueChange}
          isSaving={updateVendorCell.isPending && !!pendingChanges['company_name']}
          asContent
        />
      </td>

      {/* Other data cells */}
      {columns
        .filter((col) => col.id !== 'company_name') // Already rendered as sticky
        .map((column) => (
          <VendorTableCell
            key={column.id}
            column={column}
            row={row}
            isEditing={editingColumnId === column.id}
            onStartEdit={() => handleStartEdit(column.id)}
            onEndEdit={handleEndEdit}
            onValueChange={handleValueChange}
            isSaving={updateVendorCell.isPending && !!pendingChanges[column.id]}
          />
        ))}
    </tr>
  );
});
