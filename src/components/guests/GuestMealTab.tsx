/**
 * GuestMealTab - Tab 5: Meal Selection
 * @feature 007-guest-crud-attendance
 * @feature 024-guest-menu-management - Dynamic meal options, plus one meals
 *
 * Fields: Starter Choice, Main Choice, Dessert Choice from meal_options
 * Plus One: Separate meal selection section when has_plus_one is true
 */

import { UseFormReturn } from 'react-hook-form';
import { Loader2, UserPlus, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GuestFormData } from '@/types/guest';
import { useMealOptions } from '@/hooks/useMealOptions';
import { CourseType, COURSE_LABELS, MealOption } from '@/types/meal-option';

interface GuestMealTabProps {
  form: UseFormReturn<GuestFormData>;
  weddingId: string;
}

type MealChoiceField = 'starter_choice' | 'main_choice' | 'dessert_choice';
type PlusOneMealChoiceField = 'plus_one_starter_choice' | 'plus_one_main_choice' | 'plus_one_dessert_choice';

const COURSE_TO_FIELD: Record<CourseType, MealChoiceField> = {
  starter: 'starter_choice',
  main: 'main_choice',
  dessert: 'dessert_choice',
};

const COURSE_TO_PLUS_ONE_FIELD: Record<CourseType, PlusOneMealChoiceField> = {
  starter: 'plus_one_starter_choice',
  main: 'plus_one_main_choice',
  dessert: 'plus_one_dessert_choice',
};

export function GuestMealTab({ form, weddingId }: GuestMealTabProps) {
  const { setValue, watch } = form;

  // Watch form values
  const starterChoice = watch('starter_choice');
  const mainChoice = watch('main_choice');
  const dessertChoice = watch('dessert_choice');
  const plusOneStarterChoice = watch('plus_one_starter_choice');
  const plusOneMainChoice = watch('plus_one_main_choice');
  const plusOneDessertChoice = watch('plus_one_dessert_choice');
  const hasPlusOne = watch('has_plus_one');
  const plusOneName = watch('plus_one_name');
  const invitationStatus = watch('invitation_status');

  // Fetch meal options from database
  const { mealOptionsByCourse, isLoading, isError } = useMealOptions({ weddingId });

  const isDeclined = invitationStatus === 'declined';

  const handleMealChange = (
    field: MealChoiceField | PlusOneMealChoiceField,
    value: string
  ) => {
    if (value === '__none__') {
      setValue(field, null);
    } else {
      setValue(field, parseInt(value, 10));
    }
  };

  const getMealValue = (courseType: CourseType, isPlusOne: boolean): number | null => {
    if (isPlusOne) {
      switch (courseType) {
        case 'starter': return plusOneStarterChoice;
        case 'main': return plusOneMainChoice;
        case 'dessert': return plusOneDessertChoice;
      }
    } else {
      switch (courseType) {
        case 'starter': return starterChoice;
        case 'main': return mainChoice;
        case 'dessert': return dessertChoice;
      }
    }
  };

  const getField = (courseType: CourseType, isPlusOne: boolean): MealChoiceField | PlusOneMealChoiceField => {
    return isPlusOne ? COURSE_TO_PLUS_ONE_FIELD[courseType] : COURSE_TO_FIELD[courseType];
  };

  // Get the display label for a selected option
  const getOptionLabel = (options: MealOption[], value: number | null): string => {
    if (value === null) return 'No selection';
    const option = options.find((o) => o.option_number === value);
    if (!option) return `Option ${value} (Removed)`;
    return `${option.option_number}. ${option.meal_name}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading menu options...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load menu options. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const hasAnyOptions =
    mealOptionsByCourse.starter.length > 0 ||
    mealOptionsByCourse.main.length > 0 ||
    mealOptionsByCourse.dessert.length > 0;

  if (!hasAnyOptions) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <UtensilsCrossed className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="font-medium">No menu options configured</p>
        <p className="text-sm mt-2">
          Configure meal options in the Menu page before selecting guest meals.
        </p>
      </div>
    );
  }

  const renderCourseSelector = (courseType: CourseType, isPlusOne: boolean, disabled: boolean) => {
    const options = mealOptionsByCourse[courseType];
    const value = getMealValue(courseType, isPlusOne);
    const field = getField(courseType, isPlusOne);

    if (options.length === 0) {
      return (
        <p className="text-sm text-muted-foreground italic">
          No {COURSE_LABELS[courseType].toLowerCase()} options configured
        </p>
      );
    }

    return (
      <Select
        value={value?.toString() ?? '__none__'}
        onValueChange={(v) => handleMealChange(field, v)}
        disabled={disabled}
      >
        <SelectTrigger className={disabled ? 'opacity-50' : ''}>
          <SelectValue>
            {getOptionLabel(options, value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">No selection</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.option_number.toString()}>
              <div className="flex flex-col">
                <span>{option.option_number}. {option.meal_name}</span>
                {option.dietary_info && (
                  <span className="text-xs text-amber-600">{option.dietary_info}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="space-y-6">
      {isDeclined && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This guest has declined the invitation. Meal selections are disabled.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Select meal preferences for each course from the configured menu options.
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary Guest Meals */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">
            Primary Guest
          </h3>

          {/* Starter */}
          <div className="space-y-2">
            <Label>{COURSE_LABELS.starter}</Label>
            {renderCourseSelector('starter', false, isDeclined)}
          </div>

          {/* Main */}
          <div className="space-y-2">
            <Label>{COURSE_LABELS.main}</Label>
            {renderCourseSelector('main', false, isDeclined)}
          </div>

          {/* Dessert */}
          <div className="space-y-2">
            <Label>{COURSE_LABELS.dessert}</Label>
            {renderCourseSelector('dessert', false, isDeclined)}
          </div>
        </div>

        {/* Plus One Meals */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Plus One Meals
          </h3>

          {hasPlusOne ? (
            <>
              <p className="text-sm text-gray-500">
                {plusOneName || 'Plus One'}
              </p>

              {/* Starter */}
              <div className="space-y-2">
                <Label>{COURSE_LABELS.starter}</Label>
                {renderCourseSelector('starter', true, isDeclined)}
              </div>

              {/* Main */}
              <div className="space-y-2">
                <Label>{COURSE_LABELS.main}</Label>
                {renderCourseSelector('main', true, isDeclined)}
              </div>

              {/* Dessert */}
              <div className="space-y-2">
                <Label>{COURSE_LABELS.dessert}</Label>
                {renderCourseSelector('dessert', true, isDeclined)}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg text-center">
              <UserPlus className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No plus one for this guest.</p>
              <p className="text-gray-400 text-xs mt-1">
                Enable plus one in the RSVP tab.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
