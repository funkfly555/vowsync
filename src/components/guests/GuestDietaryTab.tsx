/**
 * GuestDietaryTab - Tab 3: Dietary Information
 * @feature 007-guest-crud-attendance
 *
 * Fields: Dietary Restrictions, Allergies, Dietary Notes
 */

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GuestFormData } from '@/types/guest';

interface GuestDietaryTabProps {
  form: UseFormReturn<GuestFormData>;
}

export function GuestDietaryTab({ form }: GuestDietaryTabProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      {/* Dietary Restrictions */}
      <div className="space-y-2">
        <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
        <Input
          id="dietary_restrictions"
          {...register('dietary_restrictions')}
          placeholder="e.g., Vegetarian, Vegan, Halal, Kosher"
        />
        <p className="text-xs text-muted-foreground">
          Common restrictions the guest follows
        </p>
        {errors.dietary_restrictions && (
          <p className="text-sm text-red-500">
            {errors.dietary_restrictions.message}
          </p>
        )}
      </div>

      {/* Allergies */}
      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies</Label>
        <Input
          id="allergies"
          {...register('allergies')}
          placeholder="e.g., Nuts, Shellfish, Dairy, Gluten"
        />
        <p className="text-xs text-muted-foreground">
          Food allergies that must be accommodated
        </p>
        {errors.allergies && (
          <p className="text-sm text-red-500">{errors.allergies.message}</p>
        )}
      </div>

      {/* Dietary Notes */}
      <div className="space-y-2">
        <Label htmlFor="dietary_notes">Additional Notes</Label>
        <Textarea
          id="dietary_notes"
          {...register('dietary_notes')}
          placeholder="Any additional dietary requirements or preferences..."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Special requests or detailed dietary information
        </p>
        {errors.dietary_notes && (
          <p className="text-sm text-red-500">{errors.dietary_notes.message}</p>
        )}
      </div>
    </div>
  );
}
