/**
 * CostsTab - Cost and availability information form fields
 * Number Available, Cost per Unit, Cost Details
 * @feature 031-items-card-table-view
 * @task T050
 */

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ItemEditFormData } from '../ItemCard';
import { formatCurrency } from '@/types/weddingItem';

interface CostsTabProps {
  totalRequired: number;
}

export function CostsTab({ totalRequired }: CostsTabProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ItemEditFormData>();

  const numberAvailable = watch('number_available');
  const costPerUnit = watch('cost_per_unit');

  // Calculate shortage
  const shortage = numberAvailable !== null ? totalRequired - numberAvailable : null;
  const hasShortage = shortage !== null && shortage > 0;

  // Calculate estimated total cost
  const estimatedTotal = costPerUnit !== null ? costPerUnit * totalRequired : null;

  return (
    <div className="p-4 space-y-4">
      {/* Availability and Cost per Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number_available">Number Available</Label>
          <Input
            id="number_available"
            type="number"
            min="0"
            placeholder="e.g., 50"
            value={numberAvailable ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setValue('number_available', value === '' ? null : parseInt(value, 10), { shouldDirty: true });
            }}
            className={errors.number_available ? 'border-red-500' : ''}
          />
          <p className="text-sm text-muted-foreground">
            Leave blank if unknown. Used for shortage warnings.
          </p>
          {errors.number_available && (
            <p className="text-sm text-red-500">{errors.number_available.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_per_unit">Cost per Unit (R)</Label>
          <Input
            id="cost_per_unit"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g., 150.00"
            value={costPerUnit ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setValue('cost_per_unit', value === '' ? null : parseFloat(value), { shouldDirty: true });
            }}
            className={errors.cost_per_unit ? 'border-red-500' : ''}
          />
          <p className="text-sm text-muted-foreground">
            Optional. Used for cost calculations.
          </p>
          {errors.cost_per_unit && (
            <p className="text-sm text-red-500">{errors.cost_per_unit.message}</p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Total Required</p>
          <p className="text-lg font-semibold text-gray-900">{totalRequired}</p>
        </div>

        {numberAvailable !== null && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Shortage</p>
            <p className={`text-lg font-semibold ${hasShortage ? 'text-red-600' : 'text-green-600'}`}>
              {hasShortage ? shortage : 'None'}
            </p>
          </div>
        )}

        {estimatedTotal !== null && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Estimated Total</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(estimatedTotal)}</p>
          </div>
        )}
      </div>

      {/* Cost Details */}
      <div className="space-y-2">
        <Label htmlFor="cost_details">Cost Details</Label>
        <Textarea
          id="cost_details"
          {...register('cost_details')}
          placeholder="e.g., Rental includes delivery and setup, bulk discount available"
          rows={3}
        />
        {errors.cost_details && (
          <p className="text-sm text-red-500">{errors.cost_details.message}</p>
        )}
      </div>
    </div>
  );
}
