/**
 * ConsumptionModelForm - Form component for consumption model parameters
 * @feature 012-bar-order-management
 * @task T017
 */

import { useFormContext } from 'react-hook-form';
import { Info } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BarOrderFormData } from '@/types/barOrder';
import { calculateServingsFromForm } from '@/lib/barOrderCalculations';

/**
 * Sub-form component for consumption model parameters
 * Displays inputs for duration, first hours, and drinks per hour
 * Shows real-time calculation preview of servings per person
 */
export function ConsumptionModelForm() {
  const form = useFormContext<BarOrderFormData>();
  const values = form.watch();

  // Calculate total servings per person for preview
  const servingsPerPerson = calculateServingsFromForm(values);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">Consumption Model</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                The consumption model calculates servings based on event
                duration. Typically, guests drink more in the first hours,
                then slow down. Adjust these parameters to match your event.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Duration */}
      <FormField
        control={form.control}
        name="event_duration_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Duration (hours)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Two-Phase Model */}
      <div className="grid grid-cols-2 gap-4">
        {/* First Hours */}
        <FormField
          control={form.control}
          name="first_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max={values.event_duration_hours}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription className="text-xs">
                High consumption period
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* First Hours Drinks */}
        <FormField
          control={form.control}
          name="first_hours_drinks_per_hour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drinks/Hour</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Per person
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Remaining Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Remaining Hours</p>
          <p className="text-2xl font-semibold">
            {Math.max(values.event_duration_hours - values.first_hours, 0).toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">
            Lower consumption period
          </p>
        </div>

        <FormField
          control={form.control}
          name="remaining_hours_drinks_per_hour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drinks/Hour</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Per person
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Calculation Preview */}
      <div className="rounded-lg bg-muted p-4 mt-4">
        <p className="text-sm text-muted-foreground mb-1">
          Total Servings Per Person
        </p>
        <p className="text-3xl font-bold">
          {servingsPerPerson.toFixed(1)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ({values.first_hours} × {values.first_hours_drinks_per_hour}) +{' '}
          ({Math.max(values.event_duration_hours - values.first_hours, 0).toFixed(1)} ×{' '}
          {values.remaining_hours_drinks_per_hour})
        </p>
      </div>
    </div>
  );
}
