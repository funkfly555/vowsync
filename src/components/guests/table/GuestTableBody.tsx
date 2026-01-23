/**
 * GuestTableBody - Table body container with row rendering
 * @feature 026-guest-view-toggle
 */

import { memo } from 'react';
import { GuestTableRow } from './GuestTableRow';
import type { TableColumnDef, GuestTableRowData, MealOptionLookup } from '@/types/guest-table';

interface GuestTableBodyProps {
  rows: GuestTableRowData[];
  columns: TableColumnDef[];
  mealOptions: MealOptionLookup;
  weddingId: string;
  selectedRows?: Set<string>;
  onSelectRow?: (id: string) => void;
}

/**
 * Renders the table body with all guest rows
 * Empty state handled in parent component
 */
export const GuestTableBody = memo(function GuestTableBody({
  rows,
  columns,
  mealOptions,
  weddingId,
  selectedRows = new Set(),
  onSelectRow,
}: GuestTableBodyProps) {
  if (rows.length === 0) {
    // Account for checkbox column when selection is enabled
    const colSpanCount = onSelectRow ? columns.length + 1 : columns.length;
    return (
      <tbody>
        <tr>
          <td
            colSpan={colSpanCount}
            className="px-4 py-12 text-center text-gray-500"
          >
            No guests found matching your filters.
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-[#E8E8E8]">
      {rows.map((row) => (
        <GuestTableRow
          key={row.id}
          row={row}
          columns={columns}
          mealOptions={mealOptions}
          weddingId={weddingId}
          isSelected={selectedRows.has(row.id)}
          onSelect={onSelectRow}
        />
      ))}
    </tbody>
  );
});
