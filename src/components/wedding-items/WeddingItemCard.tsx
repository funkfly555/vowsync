/**
 * WeddingItemCard - Card display for individual wedding item
 * @feature 013-wedding-items
 * @task T017
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Package } from 'lucide-react';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { checkAvailability, formatCurrency, formatNumber } from '@/types/weddingItem';
import { cn } from '@/lib/utils';
import { AggregationMethodBadge } from './AggregationMethodBadge';
import { AvailabilityStatusBadge } from './AvailabilityStatusBadge';
import { EventBreakdown } from './EventBreakdown';

interface WeddingItemCardProps {
  item: WeddingItemWithQuantities;
  onEdit: (item: WeddingItemWithQuantities) => void;
  onDelete: (item: WeddingItemWithQuantities) => void;
  onQuantityChange?: (itemId: string, eventId: string, quantity: number) => void;
  isUpdatingQuantity?: boolean;
}

/**
 * Card component displaying a wedding item with its key details
 */
export function WeddingItemCard({
  item,
  onEdit,
  onDelete,
  onQuantityChange,
  isUpdatingQuantity = false,
}: WeddingItemCardProps) {
  const availabilityStatus = checkAvailability(item.total_required, item.number_available);

  // T047: Handle quantity change in event breakdown
  const handleQuantityChange = (eventId: string, quantity: number) => {
    onQuantityChange?.(item.id, eventId, quantity);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item);
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        'border border-gray-200'
      )}
    >
      <CardContent className="p-4 sm:p-6">
        {/* Header with category and badges */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
              <Package className="h-4 w-4 text-gray-600" />
            </div>
            <span className="text-sm text-gray-500 truncate">{item.category}</span>
          </div>
          <div className="flex flex-col gap-1 items-end flex-shrink-0">
            <AggregationMethodBadge method={item.aggregation_method} size="sm" />
          </div>
        </div>

        {/* Description */}
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2">
          {item.description}
        </h3>

        {/* Quantity and Availability */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">
            Need: <strong>{formatNumber(item.total_required)}</strong>
          </span>
          {item.number_available !== null && (
            <span className="text-sm text-gray-600">
              · Have: <strong>{formatNumber(item.number_available)}</strong>
            </span>
          )}
        </div>

        {/* Availability Status */}
        <div className="mb-3">
          <AvailabilityStatusBadge status={availabilityStatus} size="sm" />
        </div>

        {/* Cost (T043, T044) */}
        <div className="text-sm text-gray-600 mb-3">
          {item.total_cost !== null ? (
            <>
              Total Cost: <strong>{formatCurrency(item.total_cost)}</strong>
              {item.cost_per_unit !== null && (
                <span className="text-gray-400">
                  {' '}
                  ({formatCurrency(item.cost_per_unit)}/unit)
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400">Cost not set</span>
          )}
        </div>

        {/* Supplier (if set) */}
        {item.supplier_name && (
          <div className="text-sm text-gray-500 mb-3 truncate">
            Supplier: {item.supplier_name}
          </div>
        )}

        {/* T045, T046, T047, T048: Event Breakdown */}
        {item.event_quantities && item.event_quantities.length > 0 && (
          <div className="mb-3">
            <EventBreakdown
              item={item}
              onQuantityChange={onQuantityChange ? handleQuantityChange : undefined}
              isUpdating={isUpdatingQuantity}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-gray-600 hover:text-gray-900"
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-gray-600 hover:text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
