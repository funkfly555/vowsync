/**
 * MealsTab - Meal selection form fields with Plus One column
 * Starter, main, dessert choice fields
 * Plus One meals is a placeholder for future enhancement
 * @feature 021-guest-page-redesign
 * @task T023, T035
 */

import { useFormContext } from 'react-hook-form';
import { UtensilsCrossed, Soup, IceCream, UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GuestEditFormData, MEAL_OPTIONS } from '@/types/guest';

interface MealSelectProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
}

function MealSelect({ id, label, icon, value, onChange, error }: MealSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <Select
        value={value?.toString() || '__none__'}
        onValueChange={(val) => onChange(val === '__none__' ? null : parseInt(val, 10))}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">No selection</SelectItem>
          {MEAL_OPTIONS.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              Option {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function MealsTab() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<GuestEditFormData>();

  const starterChoice = watch('starter_choice');
  const mainChoice = watch('main_choice');
  const dessertChoice = watch('dessert_choice');
  const hasPlusOne = watch('has_plus_one');
  const plusOneName = watch('plus_one_name');

  return (
    <div className="p-4">
      {/* Two-column layout on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Primary Guest Meals Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">Primary Guest Meals</h3>

          {/* Starter */}
          <MealSelect
            id="starter_choice"
            label="Starter"
            icon={<Soup className="h-4 w-4 text-gray-500" />}
            value={starterChoice}
            onChange={(value) => setValue('starter_choice', value, { shouldDirty: true })}
            error={errors.starter_choice?.message}
          />

          {/* Main Course */}
          <MealSelect
            id="main_choice"
            label="Main Course"
            icon={<UtensilsCrossed className="h-4 w-4 text-gray-500" />}
            value={mainChoice}
            onChange={(value) => setValue('main_choice', value, { shouldDirty: true })}
            error={errors.main_choice?.message}
          />

          {/* Dessert */}
          <MealSelect
            id="dessert_choice"
            label="Dessert"
            icon={<IceCream className="h-4 w-4 text-gray-500" />}
            value={dessertChoice}
            onChange={(value) => setValue('dessert_choice', value, { shouldDirty: true })}
            error={errors.dessert_choice?.message}
          />

          {/* Meal summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Meal Selection Summary</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Starter:</span>{' '}
                {starterChoice ? `Option ${starterChoice}` : 'Not selected'}
              </p>
              <p>
                <span className="font-medium">Main:</span>{' '}
                {mainChoice ? `Option ${mainChoice}` : 'Not selected'}
              </p>
              <p>
                <span className="font-medium">Dessert:</span>{' '}
                {dessertChoice ? `Option ${dessertChoice}` : 'Not selected'}
              </p>
            </div>
          </div>

          {/* Information note */}
          <p className="text-xs text-gray-500">
            Meal options correspond to the menu items provided by your catering service.
          </p>
        </div>

        {/* Plus One Meals Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Plus One Meals
          </h3>

          {hasPlusOne ? (
            <>
              {/* Plus One Info */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Plus One</p>
                  <p className="font-medium">{plusOneName || 'Not specified'}</p>
                </div>
              </div>

              {/* Placeholder for future enhancement */}
              <div className="p-4 bg-gray-100 border border-dashed border-gray-300 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Future Enhancement</p>
                <p className="text-xs text-gray-500 mt-1">
                  Individual meal selection for plus ones will be available in a future update.
                  For now, meal orders for plus ones should be coordinated separately.
                </p>
              </div>

              {/* Note about Plus One Meals */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-medium">Tip</p>
                <p className="mt-1 text-blue-600">
                  Contact your caterer to ensure plus one meal preferences are accommodated.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg text-center">
              <UserPlus className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">
                No plus one for this guest.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Enable plus one in the Basic Info tab.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
