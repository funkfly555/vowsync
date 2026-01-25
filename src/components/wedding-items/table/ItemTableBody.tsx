/**
 * ItemTableBody - Table body container (FLAT rows with inline editing)
 * @feature 031-items-card-table-view
 */

import type { ItemTableRow as ItemTableRowType, ItemTableColumnDef } from '@/types/item-table';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { ItemTableRow } from './ItemTableRow';

interface ItemTableBodyProps {
  rows: ItemTableRowType[];
  columns: ItemTableColumnDef[];
  weddingId: string;
  selectedItems: Set<string>;
  onSelectItem: (id: string, selected: boolean) => void;
  onEditItem: (item: WeddingItemWithQuantities) => void;
  onDeleteItem: (item: WeddingItemWithQuantities) => void;
}

/**
 * Renders the table body with FLAT rows (inline editing, no expansion)
 */
export function ItemTableBody({
  rows,
  columns,
  weddingId,
  selectedItems,
  onSelectItem,
  onEditItem,
  onDeleteItem,
}: ItemTableBodyProps) {
  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={columns.length}
            className="px-4 py-12 text-center text-gray-500"
          >
            No items to display
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((row) => (
        <ItemTableRow
          key={row.id}
          row={row}
          columns={columns}
          weddingId={weddingId}
          isSelected={selectedItems.has(row.id)}
          onSelect={onSelectItem}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
        />
      ))}
    </tbody>
  );
}
