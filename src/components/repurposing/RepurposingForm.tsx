/**
 * RepurposingForm Component
 * @feature 014-repurposing-timeline
 * @task T010
 *
 * 4-tab form (Movement, Responsibility, Handling, Status) using React Hook Form + Zod
 */

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import {
  repurposingFormSchema,
  type RepurposingFormSchemaType,
} from '@/schemas/repurposing';
import {
  DEFAULT_REPURPOSING_FORM,
  type RepurposingFormData,
  type RepurposingInstructionWithRelations,
  type ValidationResult,
} from '@/types/repurposing';
import { convertTimeToFormFormat } from '@/schemas/repurposing';

// =============================================================================
// Types
// =============================================================================

interface EventOption {
  id: string;
  event_name: string;
  event_date: string;
  event_start_time: string | null;
  event_end_time: string | null;
}

interface ItemOption {
  id: string;
  description: string;
  category: string;
}

interface VendorOption {
  id: string;
  company_name: string;
}

interface RepurposingFormProps {
  mode: 'create' | 'edit';
  initialData?: RepurposingInstructionWithRelations | null;
  items: ItemOption[];
  events: EventOption[];
  vendors: VendorOption[];
  onSubmit: (data: RepurposingFormSchemaType) => void;
  validationState?: {
    pickupBeforeDropoff: ValidationResult;
    pickupAfterEventEnd: ValidationResult;
    dropoffBeforeEventStart: ValidationResult;
    sameEventCheck: ValidationResult;
    hasBlockingErrors: boolean;
    hasWarnings: boolean;
  } | null;
  formId?: string;
}

// =============================================================================
// Validation Message Component
// =============================================================================

function ValidationMessage({ result }: { result: ValidationResult }) {
  if (result.type === 'success' || !result.message) return null;

  const isError = result.type === 'error';

  return (
    <Alert variant={isError ? 'destructive' : 'default'} className="mt-2">
      {isError ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      )}
      <AlertDescription className={isError ? '' : 'text-amber-700'}>
        {result.message}
      </AlertDescription>
    </Alert>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function RepurposingForm({
  mode,
  initialData,
  items,
  events,
  vendors,
  onSubmit,
  validationState,
  formId = 'repurposing-form',
}: RepurposingFormProps) {
  const isEdit = mode === 'edit';

  // Convert initial data to form format
  const defaultValues = useMemo((): RepurposingFormData => {
    if (!initialData) return DEFAULT_REPURPOSING_FORM;

    return {
      wedding_item_id: initialData.wedding_item_id,
      from_event_id: initialData.from_event_id,
      pickup_location: initialData.pickup_location,
      pickup_time: convertTimeToFormFormat(initialData.pickup_time),
      pickup_time_relative: initialData.pickup_time_relative || '',
      to_event_id: initialData.to_event_id,
      dropoff_location: initialData.dropoff_location,
      dropoff_time: convertTimeToFormFormat(initialData.dropoff_time),
      dropoff_time_relative: initialData.dropoff_time_relative || '',
      responsible_party: initialData.responsible_party,
      responsible_vendor_id: initialData.responsible_vendor_id || '',
      setup_required: initialData.setup_required,
      breakdown_required: initialData.breakdown_required,
      is_critical: initialData.is_critical,
      handling_notes: initialData.handling_notes || '',
      status: initialData.status,
      completed_by: initialData.completed_by || '',
      issue_description: initialData.issue_description || '',
    };
  }, [initialData]);

  const form = useForm<RepurposingFormSchemaType>({
    resolver: zodResolver(repurposingFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Reset form when initialData changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  // Group items by category for better UX
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, ItemOption[]> = {};
    items.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [items]);

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="movement" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="movement" className="min-h-[44px]">
              Movement
            </TabsTrigger>
            <TabsTrigger value="responsibility" className="min-h-[44px]">
              Responsibility
            </TabsTrigger>
            <TabsTrigger value="handling" className="min-h-[44px]">
              Handling
            </TabsTrigger>
            {isEdit && (
              <TabsTrigger value="status" className="min-h-[44px]">
                Status
              </TabsTrigger>
            )}
          </TabsList>

          {/* ============================================================== */}
          {/* Movement Tab */}
          {/* ============================================================== */}
          <TabsContent value="movement" className="space-y-4 mt-4">
            {/* Item Selection */}
            <FormField
              control={form.control}
              name="wedding_item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Select item to move" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {category}
                          </div>
                          {categoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.description}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source Event */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Event *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue placeholder="Select source event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.event_name} ({event.event_date})
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
                name="to_event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Event *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue placeholder="Select destination event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.event_name} ({event.event_date})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {validationState?.sameEventCheck && (
                      <ValidationMessage result={validationState.sameEventCheck} />
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Pickup Details */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm">Pickup Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pickup_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Location *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Ceremony Tent"
                          className="min-h-[44px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pickup_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Time *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          className="min-h-[44px]"
                        />
                      </FormControl>
                      <FormMessage />
                      {validationState?.pickupBeforeDropoff && (
                        <ValidationMessage result={validationState.pickupBeforeDropoff} />
                      )}
                      {validationState?.pickupAfterEventEnd && (
                        <ValidationMessage result={validationState.pickupAfterEventEnd} />
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pickup_time_relative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relative Time Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 30 min after ceremony ends"
                        className="min-h-[44px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional human-readable description of when to pick up
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dropoff Details */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm">Dropoff Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dropoff_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dropoff Location *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Reception Hall"
                          className="min-h-[44px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoff_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dropoff Time *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          className="min-h-[44px]"
                        />
                      </FormControl>
                      <FormMessage />
                      {validationState?.dropoffBeforeEventStart && (
                        <ValidationMessage result={validationState.dropoffBeforeEventStart} />
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dropoff_time_relative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relative Time Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 1 hour before reception starts"
                        className="min-h-[44px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional human-readable description of when to deliver
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* Responsibility Tab */}
          {/* ============================================================== */}
          <TabsContent value="responsibility" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="responsible_party"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsible Party *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Setup Crew, John Smith"
                      className="min-h-[44px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Person or team responsible for this movement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsible_vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Vendor (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
                    value={field.value || '__none__'}
                  >
                    <FormControl>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Select vendor (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optionally link to a vendor for tracking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">Requirements</h4>

              <FormField
                control={form.control}
                name="setup_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="min-h-[20px] min-w-[20px]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Setup Required</FormLabel>
                      <FormDescription>
                        Item needs setup at the destination
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breakdown_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="min-h-[20px] min-w-[20px]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Breakdown Required</FormLabel>
                      <FormDescription>
                        Item needs breakdown at the source
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_critical"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="min-h-[20px] min-w-[20px]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-red-600">Critical Item</FormLabel>
                      <FormDescription>
                        Mark as high priority - will be highlighted in views
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* Handling Tab */}
          {/* ============================================================== */}
          <TabsContent value="handling" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="handling_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handling Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Special handling instructions, fragile items, weight considerations..."
                      rows={6}
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Any special instructions for handling this item during movement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* ============================================================== */}
          {/* Status Tab (Edit Only) */}
          {/* ============================================================== */}
          {isEdit && (
            <TabsContent value="status" className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="issue">Issue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('status') === 'completed' && (
                <FormField
                  control={form.control}
                  name="completed_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completed By *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Name of person who completed"
                          className="min-h-[44px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch('status') === 'issue' && (
                <FormField
                  control={form.control}
                  name="issue_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the issue..."
                          rows={4}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {initialData?.started_at && (
                <div className="text-sm text-muted-foreground">
                  Started: {new Date(initialData.started_at).toLocaleString()}
                </div>
              )}

              {initialData?.completed_at && (
                <div className="text-sm text-muted-foreground">
                  Completed: {new Date(initialData.completed_at).toLocaleString()}
                  {initialData.completed_by && ` by ${initialData.completed_by}`}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </form>
    </Form>
  );
}
