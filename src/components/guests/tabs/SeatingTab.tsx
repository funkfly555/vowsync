/**
 * SeatingTab - Table seating form fields with Plus One column
 * Table number and position fields, plus visual seating arrangement
 * Plus One is shown as seated at same table
 * @feature 021-guest-page-redesign
 * @task T021, T033, T053
 */

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { UserPlus, Grid3X3 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GuestEditFormData, TABLE_NUMBERS } from '@/types/guest';
import { useGuestsByTable } from '@/hooks/useGuests';
import { SeatingArrangeModal } from '../SeatingArrangeModal';

const SEAT_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface SeatingTabProps {
  guestId: string;
  guestName: string;
  weddingId: string;
}

export function SeatingTab({ guestId, guestName, weddingId }: SeatingTabProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<GuestEditFormData>();

  const [isArrangeModalOpen, setIsArrangeModalOpen] = useState(false);

  const tableNumber = watch('table_number');
  const tablePosition = watch('table_position');
  const hasPlusOne = watch('has_plus_one');
  const plusOneName = watch('plus_one_name');

  // Fetch other guests at the same table for visual arrangement
  const { guests: seatedGuests } = useGuestsByTable(weddingId, tableNumber || null);

  const handleSelectPosition = (position: number | null) => {
    setValue('table_position', position, { shouldDirty: true });
  };

  return (
    <div className="p-4">
      {/* Two-column layout on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Primary Guest Seating Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">Primary Guest Seating</h3>

          {/* Table Number */}
          <div className="space-y-2">
            <Label htmlFor="table_number">Table Number</Label>
            <Select
              value={tableNumber || '__none__'}
              onValueChange={(value) => setValue('table_number', value === '__none__' ? '' : value, { shouldDirty: true })}
            >
              <SelectTrigger id="table_number">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No table assigned</SelectItem>
                {TABLE_NUMBERS.map((num) => (
                  <SelectItem key={num} value={num}>
                    Table {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.table_number && (
              <p className="text-sm text-red-500">{errors.table_number.message}</p>
            )}
          </div>

          {/* Seat Position */}
          <div className="space-y-2">
            <Label htmlFor="table_position">Seat Position</Label>
            <div className="flex gap-2">
              <Select
                value={tablePosition?.toString() || '__none__'}
                onValueChange={(value) =>
                  setValue('table_position', value === '__none__' ? null : parseInt(value, 10), { shouldDirty: true })
                }
                disabled={!tableNumber}
              >
                <SelectTrigger id="table_position" disabled={!tableNumber} className="flex-1">
                  <SelectValue placeholder={tableNumber ? 'Select seat' : 'Assign table first'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No seat assigned</SelectItem>
                  {SEAT_POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos.toString()}>
                      Seat {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!tableNumber}
                onClick={() => setIsArrangeModalOpen(true)}
                title="Arrange seats visually"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
            {!tableNumber && (
              <p className="text-sm text-gray-500">
                Assign a table first to select a seat position.
              </p>
            )}
            {errors.table_position && (
              <p className="text-sm text-red-500">{errors.table_position.message}</p>
            )}
          </div>

          {/* Visual indicator of current assignment */}
          {tableNumber && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Current Assignment</p>
              <p className="text-lg text-[#5C4B4B]">
                Table {tableNumber}
                {tablePosition && `, Seat ${tablePosition}`}
              </p>
              {seatedGuests.length > 1 && (
                <p className="text-sm text-gray-500 mt-2">
                  {seatedGuests.length - 1} other guest{seatedGuests.length > 2 ? 's' : ''} at this table
                </p>
              )}
            </div>
          )}
        </div>

        {/* Plus One Seating Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Plus One Seating
          </h3>

          {hasPlusOne ? (
            <>
              {/* Plus One Seating Info */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Plus One</p>
                  <p className="font-medium">{plusOneName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seating Assignment</p>
                  {tableNumber ? (
                    <p className="font-medium text-[#5C4B4B]">
                      Table {tableNumber} (with primary guest)
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">No table assigned yet</p>
                  )}
                </div>
              </div>

              {/* Note about Plus One Seating */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-medium">Note</p>
                <p className="mt-1 text-blue-600">
                  The plus one will be seated at the same table as the primary guest. Specific seat positions can be arranged using the visual seating tool.
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

      {/* Visual Seating Arrangement Modal */}
      {tableNumber && (
        <SeatingArrangeModal
          open={isArrangeModalOpen}
          onOpenChange={setIsArrangeModalOpen}
          tableNumber={tableNumber}
          currentGuestId={guestId}
          currentGuestName={guestName}
          currentPosition={tablePosition}
          seatedGuests={seatedGuests}
          onSelectPosition={handleSelectPosition}
        />
      )}
    </div>
  );
}
