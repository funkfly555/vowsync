/**
 * GuestDietaryTab - Tab 4: Dietary Information (Modal)
 * @feature 007-guest-crud-attendance
 * @feature 033-guest-page-tweaks - Structured dropdowns + plus one dietary
 *
 * Fields: Dietary Restrictions (Select), Allergies (MultiSelect), Dietary Notes (Textarea)
 * Plus One: Same fields when has_plus_one is true
 */

import { UseFormReturn, Controller } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GuestFormData, DIETARY_RESTRICTION_OPTIONS } from '@/types/guest';
import { AllergyMultiSelect } from './AllergyMultiSelect';

interface GuestDietaryTabProps {
  form: UseFormReturn<GuestFormData>;
}

export function GuestDietaryTab({ form }: GuestDietaryTabProps) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const hasPlusOne = watch('has_plus_one');
  const dietaryRestrictions = watch('dietary_restrictions');
  const plusOneDietaryRestrictions = watch('plus_one_dietary_restrictions');

  const isOtherRestriction = dietaryRestrictions?.startsWith('Other');
  const isPlusOneOtherRestriction = plusOneDietaryRestrictions?.startsWith('Other');

  const handleRestrictionChange = (value: string, isPlusOne: boolean) => {
    const field = isPlusOne ? 'plus_one_dietary_restrictions' : 'dietary_restrictions';
    if (value === '__none__') {
      setValue(field, '');
    } else if (value === 'Other') {
      // Keep existing "Other: ..." text if there is one
      const current = isPlusOne ? plusOneDietaryRestrictions : dietaryRestrictions;
      if (!current?.startsWith('Other')) {
        setValue(field, 'Other');
      }
    } else {
      setValue(field, value);
    }
  };

  const getRestrictionSelectValue = (value: string): string => {
    if (!value) return '__none__';
    if (value.startsWith('Other')) return 'Other';
    if (DIETARY_RESTRICTION_OPTIONS.includes(value as (typeof DIETARY_RESTRICTION_OPTIONS)[number])) return value;
    return '__none__';
  };

  const getOtherRestrictionText = (value: string): string => {
    if (!value?.startsWith('Other:')) return '';
    return value.replace('Other:', '').trim();
  };

  const handleOtherRestrictionText = (text: string, isPlusOne: boolean) => {
    const field = isPlusOne ? 'plus_one_dietary_restrictions' : 'dietary_restrictions';
    setValue(field, text ? `Other: ${text}` : 'Other');
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Specify dietary requirements and allergies for kitchen accommodations.
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary Guest Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">
            Primary Guest
          </h3>

          {/* Dietary Restrictions */}
          <div className="space-y-2">
            <Label>Dietary Restrictions</Label>
            <Select
              value={getRestrictionSelectValue(dietaryRestrictions)}
              onValueChange={(v) => handleRestrictionChange(v, false)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select restriction..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No selection</SelectItem>
                {DIETARY_RESTRICTION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isOtherRestriction && (
              <Input
                placeholder="Specify dietary restriction..."
                value={getOtherRestrictionText(dietaryRestrictions)}
                onChange={(e) => handleOtherRestrictionText(e.target.value, false)}
              />
            )}
            {errors.dietary_restrictions && (
              <p className="text-sm text-red-500">{errors.dietary_restrictions.message}</p>
            )}
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <Label>
              Allergies
              <span className="ml-1 text-xs font-normal text-red-500">(Important)</span>
            </Label>
            <Controller
              control={control}
              name="allergies"
              render={({ field }) => (
                <AllergyMultiSelect
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.allergies && (
              <p className="text-sm text-red-500">{errors.allergies.message}</p>
            )}
          </div>

          {/* Dietary Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Controller
              control={control}
              name="dietary_notes"
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Any additional dietary requirements or preferences..."
                  className="min-h-[80px]"
                />
              )}
            />
            {errors.dietary_notes && (
              <p className="text-sm text-red-500">{errors.dietary_notes.message}</p>
            )}
          </div>
        </div>

        {/* Plus One Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Plus One
          </h3>

          {hasPlusOne ? (
            <>
              {/* Plus One Dietary Restrictions */}
              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <Select
                  value={getRestrictionSelectValue(plusOneDietaryRestrictions)}
                  onValueChange={(v) => handleRestrictionChange(v, true)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select restriction..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No selection</SelectItem>
                    {DIETARY_RESTRICTION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isPlusOneOtherRestriction && (
                  <Input
                    placeholder="Specify dietary restriction..."
                    value={getOtherRestrictionText(plusOneDietaryRestrictions)}
                    onChange={(e) => handleOtherRestrictionText(e.target.value, true)}
                  />
                )}
                {errors.plus_one_dietary_restrictions && (
                  <p className="text-sm text-red-500">{errors.plus_one_dietary_restrictions.message}</p>
                )}
              </div>

              {/* Plus One Allergies */}
              <div className="space-y-2">
                <Label>
                  Allergies
                  <span className="ml-1 text-xs font-normal text-red-500">(Important)</span>
                </Label>
                <Controller
                  control={control}
                  name="plus_one_allergies"
                  render={({ field }) => (
                    <AllergyMultiSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.plus_one_allergies && (
                  <p className="text-sm text-red-500">{errors.plus_one_allergies.message}</p>
                )}
              </div>

              {/* Plus One Dietary Notes */}
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Controller
                  control={control}
                  name="plus_one_dietary_notes"
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Any additional dietary requirements or preferences..."
                      className="min-h-[80px]"
                    />
                  )}
                />
                {errors.plus_one_dietary_notes && (
                  <p className="text-sm text-red-500">{errors.plus_one_dietary_notes.message}</p>
                )}
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
