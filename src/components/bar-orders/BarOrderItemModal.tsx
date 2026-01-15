/**
 * BarOrderItemModal - Modal for creating/editing bar order items
 * @feature 012-bar-order-management
 * @task T027, T028
 */

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBarOrderMutations } from '@/hooks/useBarOrderMutations';
import {
  barOrderItemFormInputSchema,
  transformItemFormInput,
  type BarOrderItemFormInputSchemaType,
} from '@/schemas/barOrderItem';
import {
  calculateItemServings,
  calculateUnitsNeeded,
  calculateItemTotalCost,
  formatCurrency,
} from '@/lib/barOrderCalculations';
import type { BarOrderItem } from '@/types/barOrder';

interface BarOrderItemModalProps {
  orderId: string;
  weddingId: string;
  totalServingsPerPerson: number;
  guestCount: number;
  isOpen: boolean;
  item?: BarOrderItem | null;
  onClose: () => void;
}

/**
 * Modal for adding/editing beverage items with live calculation preview
 */
export function BarOrderItemModal({
  orderId,
  weddingId,
  totalServingsPerPerson,
  guestCount,
  isOpen,
  item,
  onClose,
}: BarOrderItemModalProps) {
  const isEditing = !!item;

  const { createBarOrderItem, updateBarOrderItem } = useBarOrderMutations({
    weddingId,
  });

  const form = useForm<BarOrderItemFormInputSchemaType>({
    resolver: zodResolver(barOrderItemFormInputSchema),
    defaultValues: {
      item_name: '',
      percentage: '',
      servings_per_unit: '1',
      cost_per_unit: '',
      sort_order: 0,
    },
  });

  // Watch form values for live calculation preview
  const watchedPercentage = form.watch('percentage');
  const watchedServingsPerUnit = form.watch('servings_per_unit');
  const watchedCostPerUnit = form.watch('cost_per_unit');

  // Calculate preview values
  const preview = useMemo(() => {
    const percentage = parseFloat(watchedPercentage) / 100 || 0;
    const servingsPerUnit = parseInt(watchedServingsPerUnit, 10) || 1;
    const costPerUnit = watchedCostPerUnit ? parseFloat(watchedCostPerUnit) : null;

    const calculatedServings = calculateItemServings(
      totalServingsPerPerson,
      percentage,
      guestCount
    );
    const unitsNeeded = calculateUnitsNeeded(calculatedServings, servingsPerUnit);
    const totalCost = calculateItemTotalCost(unitsNeeded, costPerUnit);

    return {
      calculatedServings: Math.round(calculatedServings),
      unitsNeeded,
      totalCost,
    };
  }, [
    watchedPercentage,
    watchedServingsPerUnit,
    watchedCostPerUnit,
    totalServingsPerPerson,
    guestCount,
  ]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen) {
      if (item) {
        // Edit mode: populate with item data
        form.reset({
          item_name: item.item_name,
          percentage: (item.percentage * 100).toString(),
          servings_per_unit: item.servings_per_unit.toString(),
          cost_per_unit: item.cost_per_unit?.toString() || '',
          sort_order: item.sort_order,
        });
      } else {
        // Create mode: reset to defaults
        form.reset({
          item_name: '',
          percentage: '',
          servings_per_unit: '1',
          cost_per_unit: '',
          sort_order: 0,
        });
      }
    }
  }, [isOpen, item, form]);

  const handleSubmit = async (data: BarOrderItemFormInputSchemaType) => {
    try {
      const transformedData = transformItemFormInput(data);

      // Calculate derived values that the database expects
      const percentage = parseFloat(data.percentage) / 100;
      const servingsPerUnit = parseInt(data.servings_per_unit, 10) || 1;

      const calculatedServings = calculateItemServings(
        totalServingsPerPerson,
        percentage,
        guestCount
      );
      const unitsNeeded = calculateUnitsNeeded(calculatedServings, servingsPerUnit);

      // Include computed fields with the form data
      const dataWithCalculations = {
        ...transformedData,
        calculated_servings: calculatedServings,
        units_needed: unitsNeeded,
      };

      if (isEditing && item) {
        await updateBarOrderItem.mutateAsync({
          orderId,
          itemId: item.id,
          data: dataWithCalculations,
        });
      } else {
        await createBarOrderItem.mutateAsync({
          orderId,
          data: dataWithCalculations,
        });
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isPending = createBarOrderItem.isPending || updateBarOrderItem.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Item' : 'Add Beverage Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the item details and calculations will adjust automatically.'
              : 'Add a beverage type with its percentage allocation.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Item Name */}
            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Red Wine, Beer, Champagne" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Percentage */}
            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage of Total *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        placeholder="e.g., 40"
                        {...field}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    What percentage of total drinks will be this item?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Servings Per Unit */}
            <FormField
              control={form.control}
              name="servings_per_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servings Per Unit *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="e.g., 4 (glasses per bottle)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    How many servings per bottle/case/unit?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cost Per Unit */}
            <FormField
              control={form.control}
              name="cost_per_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Per Unit (optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-7"
                        placeholder="e.g., 150.00"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Cost per bottle/case for budget tracking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Live Calculation Preview */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <h4 className="text-sm font-medium">Calculation Preview</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Servings needed:</span>
                <span className="font-medium text-right">
                  {preview.calculatedServings}
                </span>
                <span className="text-muted-foreground">Units to order:</span>
                <span className="font-medium text-right">
                  {preview.unitsNeeded}
                </span>
                <span className="text-muted-foreground">Estimated cost:</span>
                <span className="font-medium text-right">
                  {preview.totalCost !== null
                    ? formatCurrency(preview.totalCost)
                    : '-'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Based on {guestCount} guests × {totalServingsPerPerson.toFixed(1)} servings/person
              </p>
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
                {isEditing ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
