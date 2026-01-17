import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInDays, parseISO } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import type { Event } from '@/types/event';
import { findOverlappingEvents } from '@/lib/eventUtils';
import { EventOverlapBadge } from '@/components/events/EventOverlapBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { eventFormSchema, type EventFormValues } from '@/schemas/event';
import { EVENT_TYPE_OPTIONS, EVENT_ORDER_OPTIONS } from '@/lib/constants';
import { calculateDuration, formatDuration } from '@/lib/utils';

interface EventFormProps {
  onSubmit: (data: EventFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  defaultValues?: Partial<EventFormValues>;
  usedOrders?: number[];
  weddingDate?: string;
  currentEventId?: string; // For edit mode - exclude current event's order from validation
  /**
   * All events for the current wedding
   * Used to check for time overlaps when creating/editing events
   */
  allEvents?: Event[];
}

export function EventForm({
  onSubmit,
  onCancel,
  isSubmitting,
  defaultValues,
  usedOrders = [],
  weddingDate,
  currentEventId,
  allEvents,
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      event_order: defaultValues?.event_order ?? 1,
      event_name: defaultValues?.event_name ?? '',
      event_type: defaultValues?.event_type ?? 'ceremony',
      event_date: defaultValues?.event_date ?? new Date(),
      event_start_time: defaultValues?.event_start_time ?? '14:00',
      event_end_time: defaultValues?.event_end_time ?? '15:00',
      event_location: defaultValues?.event_location ?? '',
      notes: defaultValues?.notes ?? '',
    },
  });

  const watchStartTime = form.watch('event_start_time');
  const watchEndTime = form.watch('event_end_time');
  const watchEventDate = form.watch('event_date');
  const watchEventOrder = form.watch('event_order');

  // Track overlapping events for badge display
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  // Check for overlaps when date/time fields change
  useEffect(() => {
    if (!allEvents || allEvents.length === 0) {
      setOverlappingEvents([]);
      return;
    }

    const currentEvent: Partial<Event> = {
      id: currentEventId,
      event_date: watchEventDate?.toISOString().split('T')[0],
      event_start_time: watchStartTime,
      event_end_time: watchEndTime,
    };

    const overlaps = findOverlappingEvents(currentEvent, allEvents);
    setOverlappingEvents(overlaps);
  }, [watchEventDate, watchStartTime, watchEndTime, allEvents, currentEventId]);

  // Calculate duration preview
  const durationPreview = useMemo(() => {
    if (!watchStartTime || !watchEndTime) return null;
    const duration = calculateDuration(watchStartTime, watchEndTime);
    return duration > 0 ? duration : null;
  }, [watchStartTime, watchEndTime]);

  // Check if order is already used (excluding current event in edit mode)
  const isOrderUsed = useMemo(() => {
    if (!watchEventOrder) return false;
    const ordersToCheck = currentEventId
      ? usedOrders.filter((o) => o !== defaultValues?.event_order)
      : usedOrders;
    return ordersToCheck.includes(watchEventOrder);
  }, [watchEventOrder, usedOrders, currentEventId, defaultValues?.event_order]);

  // Check if event date differs from wedding date by more than 7 days
  const dateWarning = useMemo(() => {
    if (!weddingDate || !watchEventDate) return null;
    const weddingDateObj = parseISO(weddingDate);
    const daysDiff = Math.abs(differenceInDays(watchEventDate, weddingDateObj));
    if (daysDiff > 7) {
      return `Event date is ${daysDiff} days from the wedding date`;
    }
    return null;
  }, [weddingDate, watchEventDate]);

  // Available order options (filter out used ones except current)
  const availableOrderOptions = useMemo(() => {
    return EVENT_ORDER_OPTIONS.map((option) => {
      const isUsed = currentEventId
        ? usedOrders.filter((o) => o !== defaultValues?.event_order).includes(option.value)
        : usedOrders.includes(option.value);
      return {
        ...option,
        disabled: isUsed,
        label: isUsed ? `${option.label} (used)` : option.label,
      };
    });
  }, [usedOrders, currentEventId, defaultValues?.event_order]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Order and Name row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="event_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Order *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableOrderOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Event Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Ceremony" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Order warning */}
        {isOrderUsed && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Event order {watchEventOrder} is already used. Please select a different order.
            </AlertDescription>
          </Alert>
        )}

        {/* Type and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="event_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EVENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Main Chapel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date */}
        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date *</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                    field.onChange(date);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date warning */}
        {dateWarning && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{dateWarning}</AlertDescription>
          </Alert>
        )}

        {/* Start Time, End Time, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="event_start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Duration</label>
            <div className="h-10 px-3 py-2 mt-2 rounded-md border bg-muted text-muted-foreground flex items-center">
              {durationPreview ? formatDuration(durationPreview) : 'Auto-calculated'}
            </div>
          </div>
        </div>

        {/* Overlap warning badge */}
        {overlappingEvents.length > 0 && (
          <EventOverlapBadge overlappingEvents={overlappingEvents} />
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes about this event..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isOrderUsed} className="w-full sm:w-auto">
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
