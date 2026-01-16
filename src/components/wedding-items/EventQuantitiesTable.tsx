/**
 * EventQuantitiesTable - Table for managing event quantities per wedding item
 * @feature 013-wedding-items
 * @task T022, T023, T024, T025
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useEvents } from '@/hooks/useEvents';
import type { AggregationMethod } from '@/types/weddingItem';
import { calculateTotalRequired, formatNumber } from '@/types/weddingItem';
import { useDebounce } from '@/hooks/useDebounce';

interface EventQuantitiesTableProps {
  weddingId: string;
  aggregationMethod: AggregationMethod;
  eventQuantities: Record<string, number>;
  onQuantitiesChange: (quantities: Record<string, number>) => void;
  disabled?: boolean;
}

/**
 * Table component for managing event quantities with:
 * - Quantity inputs per event (T023)
 * - MAX highlighting for highest quantity (T024)
 * - Aggregation footer showing total (T025)
 */
export function EventQuantitiesTable({
  weddingId,
  aggregationMethod,
  eventQuantities,
  onQuantitiesChange,
  disabled = false,
}: EventQuantitiesTableProps) {
  const { data: events, isLoading: isLoadingEvents } = useEvents(weddingId);

  // Local state for immediate UI updates
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>(eventQuantities);

  // Calculate the max quantity for highlighting
  const maxQuantity = useMemo(() => {
    const values = Object.values(localQuantities).filter((v) => v > 0);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [localQuantities]);

  // Calculate total based on aggregation method
  const totalRequired = useMemo(() => {
    const values = Object.values(localQuantities).filter((v) => v > 0);
    return calculateTotalRequired(aggregationMethod, values);
  }, [localQuantities, aggregationMethod]);

  // Debounce the quantity changes to reduce API calls
  const debouncedQuantities = useDebounce(localQuantities, 300);

  // Track if we're updating from local changes (not from props)
  const isLocalChange = useRef(false);

  // Sync local state when props change (only if not a local change)
  const prevEventQuantitiesRef = useRef(eventQuantities);
  useEffect(() => {
    // Skip if this is the result of our own update propagating back
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }

    // Only update if the incoming props are actually different
    const propsChanged = JSON.stringify(eventQuantities) !== JSON.stringify(prevEventQuantitiesRef.current);
    if (propsChanged) {
      prevEventQuantitiesRef.current = eventQuantities;
      setLocalQuantities(eventQuantities);
    }
  }, [eventQuantities]);

  // Update parent when debounced values change
  useEffect(() => {
    // Only call onQuantitiesChange if values actually differ from last known props
    const currentStr = JSON.stringify(debouncedQuantities);
    const propsStr = JSON.stringify(prevEventQuantitiesRef.current);

    if (currentStr !== propsStr) {
      isLocalChange.current = true;
      prevEventQuantitiesRef.current = debouncedQuantities;
      onQuantitiesChange(debouncedQuantities);
    }
  }, [debouncedQuantities, onQuantitiesChange]);

  // Handle quantity change for a specific event (T023)
  const handleQuantityChange = useCallback((eventId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;

    setLocalQuantities((prev) => ({
      ...prev,
      [eventId]: numValue,
    }));
  }, []);

  // Loading state
  if (isLoadingEvents) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading events...
      </div>
    );
  }

  // No events state
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No events found for this wedding.</p>
        <p className="text-sm">Create events first to add quantities.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Event</TableHead>
            <TableHead className="w-[30%]">Date</TableHead>
            <TableHead className="w-[30%] text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const quantity = localQuantities[event.id] || 0;
            const isMaxRow = aggregationMethod === 'MAX' && quantity > 0 && quantity === maxQuantity;

            return (
              <TableRow
                key={event.id}
                className={cn(
                  // T024: Highlight MAX row
                  isMaxRow && 'bg-blue-50 border-l-4 border-l-blue-500'
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{event.event_name}</span>
                    {isMaxRow && (
                      <span className="text-xs text-blue-600 font-normal">(MAX)</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(parseISO(event.event_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min="0"
                    value={quantity || ''}
                    onChange={(e) => handleQuantityChange(event.id, e.target.value)}
                    disabled={disabled}
                    className="w-24 ml-auto text-right"
                    placeholder="0"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        {/* T025: Aggregation footer */}
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="font-semibold">
              Total ({aggregationMethod})
            </TableCell>
            <TableCell className="text-right font-bold text-lg">
              {formatNumber(totalRequired)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
