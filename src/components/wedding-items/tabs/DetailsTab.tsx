/**
 * DetailsTab - Basic item information form fields
 * Category, Description, Aggregation Method, Supplier
 * @feature 031-items-card-table-view
 * @task T050
 */

import { useFormContext } from 'react-hook-form';
import { HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { ItemEditFormData } from '../ItemCard';
import { SUGGESTED_CATEGORIES, type AggregationMethod } from '@/types/weddingItem';

export function DetailsTab() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ItemEditFormData>();

  const aggregationMethod = watch('aggregation_method');

  return (
    <div className="p-4 space-y-4">
      {/* Category and Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-red-500">*</span>
          </Label>
          <Input
            id="category"
            {...register('category')}
            placeholder="e.g., Tables, Chairs, Linens"
            list="category-suggestions"
            className={errors.category ? 'border-red-500' : ''}
          />
          <datalist id="category-suggestions">
            {SUGGESTED_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Input
            id="description"
            {...register('description')}
            placeholder="e.g., 60-inch round tables"
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Aggregation Method */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="aggregation_method">
            Aggregation Method <span className="text-red-500">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">How quantities are calculated:</p>
                <p className="text-sm mt-1">
                  <strong>ADD:</strong> Sum all event quantities (for consumables like napkins)
                </p>
                <p className="text-sm">
                  <strong>MAX:</strong> Take the highest event quantity (for reusables like tables)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={aggregationMethod}
          onValueChange={(value) => setValue('aggregation_method', value as AggregationMethod, { shouldDirty: true })}
        >
          <SelectTrigger id="aggregation_method">
            <SelectValue placeholder="Select aggregation method" />
          </SelectTrigger>
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
        <p className="text-sm text-muted-foreground">
          {aggregationMethod === 'MAX'
            ? 'Items are reused across events. Total = highest quantity needed.'
            : 'Items are consumed per event. Total = sum of all quantities.'}
        </p>
      </div>

      {/* Supplier */}
      <div className="space-y-2">
        <Label htmlFor="supplier_name">Supplier Name</Label>
        <Input
          id="supplier_name"
          {...register('supplier_name')}
          placeholder="e.g., ABC Party Rentals"
        />
      </div>
    </div>
  );
}
