/**
 * QuantitiesTab - Event quantities with inline editing
 * Shows ALL events for the wedding and allows editing quantities
 * @feature 031-items-card-table-view
 * @task T050
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
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
import { format, parseISO } from 'date-fns';
import type { ItemEditFormData } from '../ItemCard';
import { useEvents } from '@/hooks/useEvents';
import { calculateTotalRequired, formatNumber } from '@/types/weddingItem';
import { AggregationMethodBadge } from '../AggregationMethodBadge';

interface QuantitiesTabProps {
  weddingId: string;
}

export function QuantitiesTab({ weddingId }: QuantitiesTabProps) {
  const { watch, setValue } = useFormContext<ItemEditFormData>();

  const aggregationMethod = watch('aggregation_method');
  const eventQuantities = watch('event_quantities');

  // Fetch ALL events for this wedding
  const { data: events, isLoading: isLoadingEvents } = useEvents(weddingId);

  // Local state for immediate UI updates (prevents lag while typing)
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>(eventQuantities);

  // Sync local state when form values change externally
  const prevEventQuantitiesRef = useRef(eventQuantities);
  useEffect(() => {
    const propsChanged = JSON.stringify(eventQuantities) !== JSON.stringify(prevEventQuantitiesRef.current);
    if (propsChanged) {
      prevEventQuantitiesRef.current = eventQuantities;
      setLocalQuantities(eventQuantities);
    }
  }, [eventQuantities]);

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

  // Handle quantity change for a specific event
  const handleQuantityChange = useCallback((eventId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;

    const newQuantities = {
      ...localQuantities,
      [eventId]: numValue,
    };

    // Update local state immediately for responsive UI
    setLocalQuantities(newQuantities);

    // Update form state (triggers auto-save via watch subscription)
    setValue('event_quantities', newQuantities, { shouldDirty: true });
  }, [localQuantities, setValue]);

  // Loading state
  if (isLoadingEvents) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading events...
        </div>
      </div>
    );
  }

  // No events state - this means the WEDDING has no events, not that the item has no quantities
  if (!events || events.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">No events found for this wedding</p>
          <p className="text-sm mt-1">Create events in the Events page first, then come back to assign quantities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Summary row */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Method:</span>
          <AggregationMethodBadge method={aggregationMethod} />
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-600">Total Required: </span>
          <span className="text-lg font-semibold text-gray-900">{totalRequired}</span>
        </div>
      </div>

      {/* Event quantities table */}
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
                      className="w-24 ml-auto text-right"
                      placeholder="0"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
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

      {/* Aggregation explanation */}
      <p className="text-xs text-gray-500">
        {aggregationMethod === 'MAX' ? (
          <>
            <strong>MAX mode:</strong> The total required ({totalRequired}) is the highest quantity
            needed across all events. Items can be reused between events.
          </>
        ) : (
          <>
            <strong>ADD mode:</strong> The total required ({totalRequired}) is the sum of all
            event quantities. Items are consumed at each event.
          </>
        )}
      </p>
    </div>
  );
}
