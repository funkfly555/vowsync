/**
 * GuestMealTab - Tab 4: Meal Selection
 * @feature 007-guest-crud-attendance
 *
 * Fields: Starter Choice, Main Choice, Dessert Choice (options 1-5)
 */

import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GuestFormData } from '@/types/guest';

interface GuestMealTabProps {
  form: UseFormReturn<GuestFormData>;
}

const MEAL_LABELS = {
  starter: [
    { value: 1, label: 'Option 1 - Soup' },
    { value: 2, label: 'Option 2 - Salad' },
    { value: 3, label: 'Option 3 - Bruschetta' },
    { value: 4, label: 'Option 4 - Carpaccio' },
    { value: 5, label: 'Option 5 - Special' },
  ],
  main: [
    { value: 1, label: 'Option 1 - Beef' },
    { value: 2, label: 'Option 2 - Chicken' },
    { value: 3, label: 'Option 3 - Fish' },
    { value: 4, label: 'Option 4 - Vegetarian' },
    { value: 5, label: 'Option 5 - Special' },
  ],
  dessert: [
    { value: 1, label: 'Option 1 - Cake' },
    { value: 2, label: 'Option 2 - Ice Cream' },
    { value: 3, label: 'Option 3 - Fruit' },
    { value: 4, label: 'Option 4 - Cheese' },
    { value: 5, label: 'Option 5 - Special' },
  ],
};

export function GuestMealTab({ form }: GuestMealTabProps) {
  const { setValue, watch } = form;

  const starterChoice = watch('starter_choice');
  const mainChoice = watch('main_choice');
  const dessertChoice = watch('dessert_choice');

  const handleMealChange = (
    field: 'starter_choice' | 'main_choice' | 'dessert_choice',
    value: string
  ) => {
    if (value === 'none') {
      setValue(field, null);
    } else {
      setValue(field, parseInt(value, 10));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Select meal preferences for each course. Leave blank if not yet decided.
      </div>

      {/* Starter Choice */}
      <div className="space-y-2">
        <Label htmlFor="starter_choice">Starter</Label>
        <Select
          value={starterChoice?.toString() ?? 'none'}
          onValueChange={(value) => handleMealChange('starter_choice', value)}
        >
          <SelectTrigger id="starter_choice">
            <SelectValue placeholder="Select starter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No selection</SelectItem>
            {MEAL_LABELS.starter.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Choice */}
      <div className="space-y-2">
        <Label htmlFor="main_choice">Main Course</Label>
        <Select
          value={mainChoice?.toString() ?? 'none'}
          onValueChange={(value) => handleMealChange('main_choice', value)}
        >
          <SelectTrigger id="main_choice">
            <SelectValue placeholder="Select main course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No selection</SelectItem>
            {MEAL_LABELS.main.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dessert Choice */}
      <div className="space-y-2">
        <Label htmlFor="dessert_choice">Dessert</Label>
        <Select
          value={dessertChoice?.toString() ?? 'none'}
          onValueChange={(value) => handleMealChange('dessert_choice', value)}
        >
          <SelectTrigger id="dessert_choice">
            <SelectValue placeholder="Select dessert" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No selection</SelectItem>
            {MEAL_LABELS.dessert.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
