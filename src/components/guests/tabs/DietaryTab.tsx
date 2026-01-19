/**
 * DietaryTab - Dietary requirements form fields with Plus One column
 * Restrictions, allergies, notes fields
 * Plus One dietary is a placeholder for future enhancement
 * @feature 021-guest-page-redesign
 * @task T022, T034
 */

import { useFormContext, Controller } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GuestEditFormData } from '@/types/guest';

export function DietaryTab() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<GuestEditFormData>();

  const hasPlusOne = watch('has_plus_one');
  const plusOneName = watch('plus_one_name');

  return (
    <div className="p-4">
      {/* Two-column layout on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Primary Guest Dietary Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">Primary Guest Dietary</h3>

          {/* Dietary Restrictions */}
          <div className="space-y-2">
            <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
            <Input
              id="dietary_restrictions"
              {...register('dietary_restrictions')}
              placeholder="e.g., Vegetarian, Vegan, Halal, Kosher"
            />
            <p className="text-xs text-gray-500">
              Enter any dietary preferences or restrictions.
            </p>
            {errors.dietary_restrictions && (
              <p className="text-sm text-red-500">{errors.dietary_restrictions.message}</p>
            )}
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies">
              Allergies
              <span className="ml-1 text-xs font-normal text-red-500">(Important)</span>
            </Label>
            <Input
              id="allergies"
              {...register('allergies')}
              placeholder="e.g., Nuts, Shellfish, Dairy, Gluten"
              className={errors.allergies ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              List any food allergies for safety.
            </p>
            {errors.allergies && (
              <p className="text-sm text-red-500">{errors.allergies.message}</p>
            )}
          </div>

          {/* Dietary Notes */}
          <div className="space-y-2">
            <Label htmlFor="dietary_notes">Additional Notes</Label>
            <Controller
              control={control}
              name="dietary_notes"
              render={({ field }) => (
                <Textarea
                  id="dietary_notes"
                  {...field}
                  placeholder="Any additional dietary requirements or preferences..."
                  className="min-h-[100px]"
                />
              )}
            />
            {errors.dietary_notes && (
              <p className="text-sm text-red-500">{errors.dietary_notes.message}</p>
            )}
          </div>

          {/* Summary card */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800">
              Kitchen Information
            </p>
            <p className="text-xs text-amber-600 mt-1">
              This information will be shared with the catering team to ensure
              all dietary requirements are accommodated.
            </p>
          </div>
        </div>

        {/* Plus One Dietary Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Plus One Dietary
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
                  Individual dietary tracking for plus ones will be available in a future update.
                  For now, please include plus one dietary requirements in the primary guest's notes.
                </p>
              </div>

              {/* Note about Plus One Dietary */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-medium">Tip</p>
                <p className="mt-1 text-blue-600">
                  Include any plus one dietary requirements in the "Additional Notes" field of the primary guest.
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
