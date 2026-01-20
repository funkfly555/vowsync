/**
 * EventForm - 2-tab event form component
 * Tab 1: Event Information (core event details)
 * Tab 2: Shuttle Options (shuttle configuration)
 * @feature 003-events-crud
 * @feature 016-event-shuttle-options
 */

import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInDays, parseISO } from 'date-fns';
import { AlertTriangle, Calendar, Bus, Info, Hotel, MapPin } from 'lucide-react';
import type { Event } from '@/types/event';
import { findOverlappingEvents } from '@/lib/eventUtils';
import { EventOverlapBadge } from '@/components/events/EventOverlapBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
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
      // Shuttle fields
      shuttle_from_location: defaultValues?.shuttle_from_location ?? '',
      shuttle_departure_to_event: defaultValues?.shuttle_departure_to_event ?? '',
      shuttle_departure_from_event: defaultValues?.shuttle_departure_from_event ?? '',
      shuttle_notes: defaultValues?.shuttle_notes ?? '',
    },
  });

  const watchStartTime = form.watch('event_start_time');
  const watchEndTime = form.watch('event_end_time');
  const watchEventDate = form.watch('event_date');
  const watchEventOrder = form.watch('event_order');
  const watchEventLocation = form.watch('event_location');

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
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-auto">
            <TabsTrigger value="info" className="flex items-center gap-2 py-3">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Event Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="shuttles" className="flex items-center gap-2 py-3">
              <Bus className="h-4 w-4" />
              <span className="hidden sm:inline">Shuttles</span>
              <span className="sm:hidden">Shuttles</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EVENT INFORMATION */}
          <TabsContent value="info" className="space-y-4 mt-4">
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
          </TabsContent>

          {/* TAB 2: SHUTTLE OPTIONS - VERTICAL TIMELINE */}
          <TabsContent value="shuttles" className="space-y-6 mt-4">
            {/* Info Banner */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Shuttle Route Configuration</AlertTitle>
              <AlertDescription className="text-blue-800">
                Configure shuttle transportation for guests attending this event.
                These settings will be used when assigning guests to shuttles.
              </AlertDescription>
            </Alert>

            {/* Timeline Container */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-6">
              {/* Section Title */}
              <div className="mb-6 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(212, 165, 165, 0.1)' }}
                >
                  <Bus className="h-4 w-4" style={{ color: '#D4A5A5' }} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Shuttle Journey Timeline
                </h3>
              </div>

              {/* Vertical Timeline */}
              <div className="relative">
                {/* Vertical connecting line */}
                <div
                  className="absolute left-7 sm:left-8 top-8 bottom-8 w-0.5"
                  style={{
                    background: 'linear-gradient(to bottom, #D4A5A5 0%, #C9A961 50%, #A8B8A6 100%)'
                  }}
                />

                {/* Timeline Steps */}
                <div className="space-y-6 sm:space-y-8">
                  {/* STEP 1: PICKUP */}
                  <div className="relative flex gap-3 sm:gap-4">
                    {/* Marker Circle */}
                    <div
                      className="relative z-10 flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-white"
                      style={{
                        border: '3px solid #D4A5A5',
                        backgroundColor: '#FFF5F5'
                      }}
                    >
                      <Hotel className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#D4A5A5' }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1 sm:pt-2">
                      {/* Step Label */}
                      <div
                        className="mb-2 sm:mb-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: '#D4A5A5' }}
                      >
                        1. Pickup Location
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3">
                        <FormField
                          control={form.control}
                          name="shuttle_from_location"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Where guests are picked up
                              </Label>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Hotel Grand Plaza"
                                  className="h-10"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shuttle_departure_to_event"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Departs at
                              </Label>
                              <FormControl>
                                <Input
                                  type="time"
                                  className="h-10 w-full md:w-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: EVENT */}
                  <div className="relative flex gap-3 sm:gap-4">
                    {/* Marker Circle */}
                    <div
                      className="relative z-10 flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-white"
                      style={{
                        border: '3px solid #C9A961',
                        backgroundColor: '#FFFBF0'
                      }}
                    >
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#C9A961' }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1 sm:pt-2">
                      {/* Step Label */}
                      <div
                        className="mb-2 sm:mb-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: '#C9A961' }}
                      >
                        2. Event Location
                      </div>

                      {/* Fields (Read-only) */}
                      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Event venue
                          </Label>
                          <Input
                            value={watchEventLocation || ''}
                            disabled
                            className="h-10 bg-muted/50"
                          />
                          <p className="text-xs italic text-muted-foreground">
                            Auto-filled from event details
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Starts at
                          </Label>
                          <Input
                            type="time"
                            value={watchStartTime || ''}
                            disabled
                            className="h-10 w-full md:w-32 bg-muted/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: RETURN */}
                  <div className="relative flex gap-3 sm:gap-4">
                    {/* Marker Circle */}
                    <div
                      className="relative z-10 flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-white"
                      style={{
                        border: '3px solid #A8B8A6',
                        backgroundColor: '#F5FAF5'
                      }}
                    >
                      <Hotel className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#A8B8A6' }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1 sm:pt-2">
                      {/* Step Label */}
                      <div
                        className="mb-2 sm:mb-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: '#A8B8A6' }}
                      >
                        3. Return Journey
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Return destination
                          </Label>
                          <Input
                            value={watchEventLocation ? `Back to pickup location` : ''}
                            disabled
                            placeholder="Same as pickup location"
                            className="h-10 bg-muted/50"
                          />
                          <p className="text-xs italic text-muted-foreground">
                            Returns guests to pickup location
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="shuttle_departure_from_event"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Departs at
                              </Label>
                              <FormControl>
                                <Input
                                  type="time"
                                  className="h-10 w-full md:w-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shuttle Notes */}
            <FormField
              control={form.control}
              name="shuttle_notes"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Special instructions, multiple shuttles, accessibility needs, etc..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 border-t">
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
