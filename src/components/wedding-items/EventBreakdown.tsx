/**
 * EventBreakdown - Expandable event breakdown for wedding item cards
 * @feature 013-wedding-items
 * @task T045, T046, T047, T048
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronDown, ChevronUp, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { formatNumber } from '@/types/weddingItem';
import { format } from 'date-fns';

interface EventBreakdownProps {
  item: WeddingItemWithQuantities;
  onQuantityChange?: (eventId: string, quantity: number) => void;
  isUpdating?: boolean;
}

/**
 * Expandable/collapsible event breakdown component
 * Shows event name, date, and quantity with inline editing capability
 * Highlights max quantity row for MAX aggregation items
 */
export function EventBreakdown({
  item,
  onQuantityChange,
  isUpdating = false,
}: EventBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});

  // Track if we're updating from local changes (not from props)
  const isLocalChange = useRef(false);
  const lastSentQuantities = useRef<Record<string, number>>({});

  // Initialize local quantities from item data
  useEffect(() => {
    // Skip if this is the result of our own update propagating back
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }

    const quantities: Record<string, number> = {};
    item.event_quantities?.forEach((eq) => {
      quantities[eq.event_id] = eq.quantity_required;
    });
    setLocalQuantities(quantities);
    lastSentQuantities.current = quantities;
  }, [item.event_quantities]);

  // T048: Find max quantity for highlighting
  const maxQuantity = useMemo(() => {
    if (!item.event_quantities?.length) return 0;
    return Math.max(...item.event_quantities.map((eq) => eq.quantity_required));
  }, [item.event_quantities]);

  const isMaxRow = useCallback(
    (quantity: number) => {
      return item.aggregation_method === 'MAX' && quantity === maxQuantity && maxQuantity > 0;
    },
    [item.aggregation_method, maxQuantity]
  );

  // Debounced quantity changes (T047)
  const debouncedQuantities = useDebounce(localQuantities, 500);

  useEffect(() => {
    if (!onQuantityChange) return;

    // Compare with last sent quantities to avoid redundant calls
    item.event_quantities?.forEach((eq) => {
      const newQuantity = debouncedQuantities[eq.event_id];
      const lastSent = lastSentQuantities.current[eq.event_id];
      if (newQuantity !== undefined && newQuantity !== lastSent) {
        isLocalChange.current = true;
        lastSentQuantities.current[eq.event_id] = newQuantity;
        onQuantityChange(eq.event_id, newQuantity);
      }
    });
  }, [debouncedQuantities, item.event_quantities, onQuantityChange]);

  const handleQuantityChange = (eventId: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity >= 0) {
      setLocalQuantities((prev) => ({ ...prev, [eventId]: quantity }));
    }
  };

  // Don't render if no event quantities
  if (!item.event_quantities || item.event_quantities.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-gray-600 hover:text-gray-900 p-2"
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Event Breakdown ({item.event_quantities.length} events)
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-2 font-medium text-gray-600">Event</th>
                <th className="text-left p-2 font-medium text-gray-600">Date</th>
                <th className="text-right p-2 font-medium text-gray-600">Qty</th>
              </tr>
            </thead>
            <tbody>
              {item.event_quantities.map((eq) => {
                const isMax = isMaxRow(eq.quantity_required);
                return (
                  <tr
                    key={eq.event_id}
                    className={cn(
                      'border-b last:border-b-0 transition-colors',
                      isMax && 'bg-blue-50 border-l-4 border-l-blue-500'
                    )}
                  >
                    <td className="p-2">
                      <span className="font-medium">{eq.event?.event_name ?? 'Unknown Event'}</span>
                      {isMax && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">
                          (MAX)
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-gray-500">
                      {eq.event?.event_date
                        ? format(new Date(eq.event.event_date), 'MMM d, yyyy')
                        : '—'}
                    </td>
                    <td className="p-2 text-right">
                      {onQuantityChange ? (
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            min={0}
                            value={localQuantities[eq.event_id] ?? eq.quantity_required}
                            onChange={(e) =>
                              handleQuantityChange(eq.event_id, e.target.value)
                            }
                            className="w-20 h-8 text-right"
                            disabled={isUpdating}
                          />
                          {isUpdating && (
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      ) : (
                        <span className="font-medium">
                          {formatNumber(eq.quantity_required)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Footer showing aggregation result */}
            <tfoot>
              <tr className="bg-gray-50 border-t">
                <td colSpan={2} className="p-2 text-right font-medium text-gray-600">
                  Total ({item.aggregation_method}):
                </td>
                <td className="p-2 text-right font-bold">
                  {formatNumber(item.total_required)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
