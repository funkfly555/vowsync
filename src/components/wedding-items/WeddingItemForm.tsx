/**
 * WeddingItemForm - Form for creating/editing wedding items
 * Tabbed layout: Basic Info, Quantities, Costs, Notes
 * @feature 013-wedding-items, 031-items-card-table-view
 * @task T014, T026, T050
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HelpCircle, Info, Hash, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { weddingItemFormSchema, type WeddingItemFormSchemaType } from '@/schemas/weddingItem';
import {
  SUGGESTED_CATEGORIES,
  DEFAULT_WEDDING_ITEM_FORM,
  type WeddingItemFormData,
} from '@/types/weddingItem';
import { getAggregationMethodTooltip } from './AggregationMethodBadge';
import { EventQuantitiesTable } from './EventQuantitiesTable';

type ItemFormTab = 'basic' | 'quantities' | 'costs' | 'notes';

interface WeddingItemFormProps {
  weddingId: string;
  onSubmit: (data: WeddingItemFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  defaultValues?: Partial<WeddingItemFormData>;
  mode?: 'create' | 'edit';
}

/**
 * Form component for creating and editing wedding items
 * Tabbed layout: Basic Info, Quantities, Costs, Notes
 * Uses React Hook Form with Zod validation
 */
export function WeddingItemForm({
  weddingId,
  onSubmit,
  onCancel,
  isSubmitting,
  defaultValues,
  mode = 'create',
}: WeddingItemFormProps) {
  const [activeTab, setActiveTab] = useState<ItemFormTab>('basic');

  const form = useForm<WeddingItemFormSchemaType>({
    resolver: zodResolver(weddingItemFormSchema),
    defaultValues: {
      category: defaultValues?.category ?? DEFAULT_WEDDING_ITEM_FORM.category,
      description: defaultValues?.description ?? DEFAULT_WEDDING_ITEM_FORM.description,
      aggregation_method:
        defaultValues?.aggregation_method ?? DEFAULT_WEDDING_ITEM_FORM.aggregation_method,
      number_available:
        defaultValues?.number_available ?? DEFAULT_WEDDING_ITEM_FORM.number_available,
      cost_per_unit: defaultValues?.cost_per_unit ?? DEFAULT_WEDDING_ITEM_FORM.cost_per_unit,
      cost_details: defaultValues?.cost_details ?? DEFAULT_WEDDING_ITEM_FORM.cost_details,
      supplier_name: defaultValues?.supplier_name ?? DEFAULT_WEDDING_ITEM_FORM.supplier_name,
      notes: defaultValues?.notes ?? DEFAULT_WEDDING_ITEM_FORM.notes,
      event_quantities: defaultValues?.event_quantities ?? DEFAULT_WEDDING_ITEM_FORM.event_quantities,
    },
  });

  const handleFormSubmit = (data: WeddingItemFormSchemaType) => {
    // Transform to WeddingItemFormData format
    const formData: WeddingItemFormData = {
      category: data.category,
      description: data.description,
      aggregation_method: data.aggregation_method,
      number_available: data.number_available,
      cost_per_unit: data.cost_per_unit,
      cost_details: data.cost_details,
      supplier_name: data.supplier_name,
      notes: data.notes,
      event_quantities: data.event_quantities,
    };
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ItemFormTab)}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Info className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Basic Info</span>
              <span className="sm:hidden">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="quantities" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Hash className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Quantities</span>
              <span className="sm:hidden">Qty</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Costs</span>
              <span className="sm:hidden">Cost</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Notes</span>
              <span className="sm:hidden">Notes</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="basic" className="mt-0 space-y-4">
            {/* Category and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Tables, Chairs, Linens"
                        list="category-suggestions"
                        {...field}
                      />
                    </FormControl>
                    <datalist id="category-suggestions">
                      {SUGGESTED_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 60-inch round tables" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Aggregation Method */}
            <FormField
              control={form.control}
              name="aggregation_method"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Aggregation Method *</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">How quantities are calculated:</p>
                          <p className="text-sm mt-1">
                            <strong>ADD:</strong> Sum all event quantities (for consumables like
                            napkins)
                          </p>
                          <p className="text-sm">
                            <strong>MAX:</strong> Take the highest event quantity (for reusables like
                            tables)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select aggregation method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MAX">
                        <div className="flex flex-col items-start">
                          <span>MAX (Reusable)</span>
                          <span className="text-xs text-muted-foreground">
                            Use highest quantity across events
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ADD">
                        <div className="flex flex-col items-start">
                          <span>ADD (Consumable)</span>
                          <span className="text-xs text-muted-foreground">
                            Sum quantities from all events
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {getAggregationMethodTooltip(field.value)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Supplier */}
            <FormField
              control={form.control}
              name="supplier_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., ABC Party Rentals"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Tab 2: Quantities */}
          <TabsContent value="quantities" className="mt-0 space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Specify how many of this item you need for each event.
            </div>
            <FormField
              control={form.control}
              name="event_quantities"
              render={({ field }) => (
                <EventQuantitiesTable
                  weddingId={weddingId}
                  aggregationMethod={form.watch('aggregation_method')}
                  eventQuantities={field.value}
                  onQuantitiesChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </TabsContent>

          {/* Tab 3: Costs */}
          <TabsContent value="costs" className="mt-0 space-y-4">
            {/* Availability and Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number_available"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number Available</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 50"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? null : parseInt(value, 10));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave blank if unknown. Used for shortage warnings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost per Unit (R)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 150.00"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? null : parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>Optional. Used for cost calculations.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cost Details */}
            <FormField
              control={form.control}
              name="cost_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Rental includes delivery and setup, bulk discount available"
                      rows={3}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Tab 4: Notes */}
          <TabsContent value="notes" className="mt-0 space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this item..."
                      rows={6}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Add any special instructions, vendor contacts, or other details.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* Actions - Below tabs */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Item' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
