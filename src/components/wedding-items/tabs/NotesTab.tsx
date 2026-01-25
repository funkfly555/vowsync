/**
 * NotesTab - Notes textarea for additional item information
 * @feature 031-items-card-table-view
 * @task T050
 */

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ItemEditFormData } from '../ItemCard';

export function NotesTab() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ItemEditFormData>();

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Any additional notes about this item..."
          rows={8}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground">
          Add any special instructions, vendor contacts, or other details.
        </p>
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>
    </div>
  );
}
