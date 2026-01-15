/**
 * BarOrderModal - Modal for creating/editing bar orders
 * @feature 012-bar-order-management
 * @task T018, T019, T020, T021, T022
 */

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ConsumptionModelForm } from './ConsumptionModelForm';
import { useEventsForDropdown, useVendorsForDropdown, useEventGuestCount } from '@/hooks/useBarOrder';
import { useBarOrderMutations } from '@/hooks/useBarOrderMutations';
import { barOrderFormSchema } from '@/schemas/barOrder';
import { getStatusOptions } from '@/lib/barOrderStatus';
import type { BarOrderFormData, BarOrderWithRelations } from '@/types/barOrder';
import { DEFAULT_BAR_ORDER_FORM } from '@/types/barOrder';

interface BarOrderModalProps {
  weddingId: string;
  isOpen: boolean;
  order?: BarOrderWithRelations | null;
  onClose: () => void;
}

/**
 * Modal component for creating and editing bar orders
 * Includes event/vendor selection, consumption model form, and status management
 */
export function BarOrderModal({
  weddingId,
  isOpen,
  order,
  onClose,
}: BarOrderModalProps) {
  const isEditing = !!order;

  // Fetch dropdown options
  const { data: events = [] } = useEventsForDropdown(weddingId);
  const { data: vendors = [] } = useVendorsForDropdown(weddingId);

  // Mutations
  const { createBarOrder, updateBarOrder } = useBarOrderMutations({ weddingId });

  // Form setup
  const form = useForm<BarOrderFormData>({
    resolver: zodResolver(barOrderFormSchema),
    defaultValues: DEFAULT_BAR_ORDER_FORM,
  });

  const selectedEventId = form.watch('event_id');

  // Fetch guest count when event is selected
  const { data: eventGuestCount } = useEventGuestCount(selectedEventId);

  // Status options
  const statusOptions = getStatusOptions();

  // Reset form when modal opens/closes or order changes
  useEffect(() => {
    if (isOpen) {
      if (order) {
        // Edit mode: populate with order data
        form.reset({
          name: order.name,
          event_id: order.event_id,
          vendor_id: order.vendor_id,
          guest_count_adults: order.guest_count_adults,
          event_duration_hours: order.event_duration_hours,
          first_hours: order.first_hours,
          first_hours_drinks_per_hour: order.first_hours_drinks_per_hour,
          remaining_hours_drinks_per_hour: order.remaining_hours_drinks_per_hour,
          status: order.status,
          notes: order.notes,
        });
      } else {
        // Create mode: reset to defaults
        form.reset(DEFAULT_BAR_ORDER_FORM);
      }
    }
  }, [isOpen, order, form]);

  // Auto-populate guest count and duration when event is selected
  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      const selectedEvent = events.find((e) => e.id === selectedEventId);
      if (selectedEvent) {
        // Use duration_hours from event if available
        if (selectedEvent.duration_hours) {
          form.setValue('event_duration_hours', Math.max(selectedEvent.duration_hours, 0.5));
        }

        // Set guest count from event's expected_guests_adults
        if (selectedEvent.expected_guests_adults) {
          form.setValue('guest_count_adults', selectedEvent.expected_guests_adults);
        } else if (eventGuestCount !== undefined) {
          form.setValue('guest_count_adults', eventGuestCount);
        }
      }
    }
  }, [selectedEventId, events, eventGuestCount, form]);

  const handleSubmit = async (data: BarOrderFormData) => {
    try {
      if (isEditing && order) {
        await updateBarOrder.mutateAsync({
          orderId: order.id,
          data,
        });
      } else {
        await createBarOrder.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error is handled by mutation onError
      console.error('Form submission error:', error);
    }
  };

  const isPending = createBarOrder.isPending || updateBarOrder.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Bar Order' : 'Create Bar Order'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the bar order details and consumption model.'
              : 'Create a new bar order with event linkage and consumption model.'}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Reception Bar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Event Selection */}
                <FormField
                  control={form.control}
                  name="event_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Event</FormLabel>
                      <Select
                        value={field.value || 'none'}
                        onValueChange={(value) =>
                          field.onChange(value === 'none' ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No event</SelectItem>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vendor Selection */}
                <FormField
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <Select
                        value={field.value || 'none'}
                        onValueChange={(value) =>
                          field.onChange(value === 'none' ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vendor (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No vendor</SelectItem>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.business_name}
                              {vendor.category && (
                                <span className="text-muted-foreground ml-2">
                                  ({vendor.category})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Guest Count */}
                <FormField
                  control={form.control}
                  name="guest_count_adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adult Guest Count *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Consumption Model */}
              <ConsumptionModelForm />

              <Separator />

              {/* Status and Notes */}
              <div className="space-y-4">
                {/* Status (only show in edit mode) */}
                {isEditing && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((option) => (
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
                          placeholder="Additional notes..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Order'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
