/**
 * BarOrderItemsTable - Displays bar order items in a table format
 * @feature 012-bar-order-management
 * @task T026
 */

import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatPercentage } from '@/lib/barOrderCalculations';
import type { BarOrderItem } from '@/types/barOrder';

interface BarOrderItemsTableProps {
  items: BarOrderItem[];
  onEdit: (item: BarOrderItem) => void;
  onDelete: (itemId: string) => void;
}

/**
 * Table displaying bar order items with calculations
 */
export function BarOrderItemsTable({
  items,
  onEdit,
  onDelete,
}: BarOrderItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No items added yet. Click "Add Item" to add beverages to this order.
        </p>
      </div>
    );
  }

  // Sort items by sort_order (handle null/undefined values)
  const sortedItems = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table aria-label="Bar order items">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" aria-hidden="true"></TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
            <TableHead className="text-right">Servings</TableHead>
            <TableHead className="text-right">Units</TableHead>
            <TableHead className="text-right">Cost/Unit</TableHead>
            <TableHead className="text-right">Total Cost</TableHead>
            <TableHead className="w-[100px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-muted-foreground" aria-hidden="true">
                <GripVertical className="h-4 w-4" aria-hidden="true" />
              </TableCell>
              <TableCell className="font-medium">{item.item_name}</TableCell>
              <TableCell className="text-right">
                {formatPercentage(item.percentage)}
              </TableCell>
              <TableCell className="text-right">
                {(item.calculated_servings ?? 0).toFixed(0)}
              </TableCell>
              <TableCell className="text-right">{item.units_needed ?? 0}</TableCell>
              <TableCell className="text-right">
                {item.cost_per_unit !== null
                  ? formatCurrency(item.cost_per_unit)
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {item.total_cost !== null
                  ? formatCurrency(item.total_cost)
                  : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit {item.item_name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete {item.item_name}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
