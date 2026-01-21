/**
 * MealsTab - Meal selection form fields with Plus One column
 * Uses useMealOptions hook to fetch actual meal names from database
 * @feature 021-guest-page-redesign
 * @feature 025-guest-page-fixes - Plus One meals implementation
 * @task T023, T035
 */

import { useFormContext } from 'react-hook-form';
import { UtensilsCrossed, Soup, IceCream, UserPlus, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GuestEditFormData } from '@/types/guest';
import { useMealOptions } from '@/hooks/useMealOptions';
import { MealOption, CourseType, getMealOptionLabel } from '@/types/meal-option';

interface MealsTabProps {
  weddingId: string;
}

interface MealSelectProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: number | null;
  onChange: (value: number | null) => void;
  options: MealOption[];
  error?: string;
  isLoading?: boolean;
}

function MealSelect({ id, label, icon, value, onChange, options, error, isLoading }: MealSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <Select
        value={value?.toString() || '__none__'}
        onValueChange={(val) => onChange(val === '__none__' ? null : parseInt(val, 10))}
        disabled={isLoading}
      >
        <SelectTrigger id={id}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select option" />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">No selection</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.option_number} value={option.option_number.toString()}>
              {option.meal_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function MealsTab({ weddingId }: MealsTabProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<GuestEditFormData>();

  // Fetch meal options from database
  const { mealOptions, mealOptionsByCourse, isLoading } = useMealOptions({ weddingId });

  // Primary guest meal choices
  const starterChoice = watch('starter_choice');
  const mainChoice = watch('main_choice');
  const dessertChoice = watch('dessert_choice');

  // Plus one meal choices (025-guest-page-fixes)
  const plusOneStarterChoice = watch('plus_one_starter_choice');
  const plusOneMainChoice = watch('plus_one_main_choice');
  const plusOneDessertChoice = watch('plus_one_dessert_choice');

  const hasPlusOne = watch('has_plus_one');

  // Helper to get meal name for summary display
  const getMealName = (courseType: CourseType, optionNumber: number | null): string => {
    return getMealOptionLabel(mealOptions, courseType, optionNumber);
  };

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
            options={mealOptionsByCourse.starter}
            error={errors.starter_choice?.message}
            isLoading={isLoading}
          />

          {/* Main Course */}
          <MealSelect
            id="main_choice"
            label="Main Course"
            icon={<UtensilsCrossed className="h-4 w-4 text-gray-500" />}
            value={mainChoice}
            onChange={(value) => setValue('main_choice', value, { shouldDirty: true })}
            options={mealOptionsByCourse.main}
            error={errors.main_choice?.message}
            isLoading={isLoading}
          />

          {/* Dessert */}
          <MealSelect
            id="dessert_choice"
            label="Dessert"
            icon={<IceCream className="h-4 w-4 text-gray-500" />}
            value={dessertChoice}
            onChange={(value) => setValue('dessert_choice', value, { shouldDirty: true })}
            options={mealOptionsByCourse.dessert}
            error={errors.dessert_choice?.message}
            isLoading={isLoading}
          />

          {/* Meal summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Meal Selection Summary</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Starter:</span>{' '}
                {isLoading ? 'Loading...' : getMealName('starter', starterChoice)}
              </p>
              <p>
                <span className="font-medium">Main:</span>{' '}
                {isLoading ? 'Loading...' : getMealName('main', mainChoice)}
              </p>
              <p>
                <span className="font-medium">Dessert:</span>{' '}
                {isLoading ? 'Loading...' : getMealName('dessert', dessertChoice)}
              </p>
            </div>
          </div>

          {/* Information note */}
          <p className="text-xs text-gray-500">
            Meal options are configured in the wedding settings menu.
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
              {/* Plus One Starter (025-guest-page-fixes) */}
              <MealSelect
                id="plus_one_starter_choice"
                label="Starter"
                icon={<Soup className="h-4 w-4 text-gray-500" />}
                value={plusOneStarterChoice}
                onChange={(value) => setValue('plus_one_starter_choice', value, { shouldDirty: true })}
                options={mealOptionsByCourse.starter}
                error={errors.plus_one_starter_choice?.message}
                isLoading={isLoading}
              />

              {/* Plus One Main Course (025-guest-page-fixes) */}
              <MealSelect
                id="plus_one_main_choice"
                label="Main Course"
                icon={<UtensilsCrossed className="h-4 w-4 text-gray-500" />}
                value={plusOneMainChoice}
                onChange={(value) => setValue('plus_one_main_choice', value, { shouldDirty: true })}
                options={mealOptionsByCourse.main}
                error={errors.plus_one_main_choice?.message}
                isLoading={isLoading}
              />

              {/* Plus One Dessert (025-guest-page-fixes) */}
              <MealSelect
                id="plus_one_dessert_choice"
                label="Dessert"
                icon={<IceCream className="h-4 w-4 text-gray-500" />}
                value={plusOneDessertChoice}
                onChange={(value) => setValue('plus_one_dessert_choice', value, { shouldDirty: true })}
                options={mealOptionsByCourse.dessert}
                error={errors.plus_one_dessert_choice?.message}
                isLoading={isLoading}
              />

              {/* Plus One Meal summary (025-guest-page-fixes) */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Plus One Meal Summary</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Starter:</span>{' '}
                    {isLoading ? 'Loading...' : getMealName('starter', plusOneStarterChoice)}
                  </p>
                  <p>
                    <span className="font-medium">Main:</span>{' '}
                    {isLoading ? 'Loading...' : getMealName('main', plusOneMainChoice)}
                  </p>
                  <p>
                    <span className="font-medium">Dessert:</span>{' '}
                    {isLoading ? 'Loading...' : getMealName('dessert', plusOneDessertChoice)}
                  </p>
                </div>
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
