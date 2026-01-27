/**
 * GuestSeatingTab - Tab 3: Table Seating Assignment
 * @feature 033-guest-page-tweaks
 *
 * Fields: Table Number, Seat Position (primary + plus one)
 * Plus One gets its own seat position dropdown + visual arrange
 */

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UserPlus, Grid3X3, AlertCircle, Armchair } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GuestFormData, TABLE_NUMBERS } from '@/types/guest';
import { useGuestsByTable } from '@/hooks/useGuests';
import { SeatingArrangeModal } from './SeatingArrangeModal';

interface GuestSeatingTabProps {
  form: UseFormReturn<GuestFormData>;
  weddingId: string;
  guestId?: string;
  guestName?: string;
}

const SEAT_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function GuestSeatingTab({ form, weddingId, guestId, guestName }: GuestSeatingTabProps) {
  const { setValue, watch } = form;
  const [isArrangeModalOpen, setIsArrangeModalOpen] = useState(false);

  const tableNumber = watch('table_number') as string | null | undefined;
  const tablePosition = watch('table_position') as number | null | undefined;
  const plusOneTablePosition = watch('plus_one_table_position') as number | null | undefined;
  const hasPlusOne = watch('has_plus_one');
  const plusOneName = watch('plus_one_name');
  const invitationStatus = watch('invitation_status');

  const isDeclined = invitationStatus === 'declined';

  // Fetch other guests at the same table for visual arrangement
  const { guests: seatedGuests } = useGuestsByTable(weddingId, tableNumber || null);

  // Seats occupied by the other person in this pair (for filtering dropdowns)
  const primaryOccupied = tablePosition ?? undefined;
  const plusOneOccupied = plusOneTablePosition ?? undefined;

  const handleSelectPosition = (position: number | null) => {
    setValue('table_position', position);
  };

  const handleSelectPlusOnePosition = (position: number | null) => {
    setValue('plus_one_table_position', position);
  };

  // Get seats occupied by other guests at this table (excluding current guest)
  const otherOccupiedSeats = seatedGuests
    .filter((g) => g.id !== guestId)
    .map((g) => g.table_position)
    .filter((pos): pos is number => pos !== null);

  // Filter available seats for primary (exclude plus one's seat and other guests' seats)
  const availablePrimarySeats = SEAT_POSITIONS.filter(
    (pos) => pos !== plusOneOccupied && !otherOccupiedSeats.includes(pos)
  );

  // Filter available seats for plus one (exclude primary's seat and other guests' seats)
  const availablePlusOneSeats = SEAT_POSITIONS.filter(
    (pos) => pos !== primaryOccupied && !otherOccupiedSeats.includes(pos)
  );

  const isCreateMode = !guestId;

  return (
    <div className="space-y-6">
      {isCreateMode ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <Armchair className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">Save the guest first</p>
          <p className="text-gray-400 text-sm mt-1">
            Table and seating assignments will be available after the guest has been created.
          </p>
        </div>
      ) : (
      <>
      {isDeclined && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This guest has declined the invitation. Seating assignments are disabled.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Assign table and seat position for both primary guest and plus one.
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary Guest Seating */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">
            Primary Guest
          </h3>

          {/* Table Number */}
          <div className="space-y-2">
            <Label htmlFor="table_number">Table Number</Label>
            <Select
              value={tableNumber || '__none__'}
              onValueChange={(value) => {
                const newTable = value === '__none__' ? null : value;
                setValue('table_number', newTable);
                // Reset both seat positions when table changes
                if (newTable !== tableNumber) {
                  setValue('table_position', null);
                  setValue('plus_one_table_position', null);
                }
              }}
              disabled={isDeclined}
            >
              <SelectTrigger id="table_number" className={isDeclined ? 'opacity-50' : ''}>
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
          </div>

          {/* Seat Position */}
          <div className="space-y-2">
            <Label htmlFor="table_position">Seat Position</Label>
            <div className="flex gap-2">
              <Select
                value={tablePosition?.toString() || '__none__'}
                onValueChange={(value) =>
                  setValue(
                    'table_position',
                    value === '__none__' ? null : parseInt(value, 10)
                  )
                }
                disabled={!tableNumber || isDeclined}
              >
                <SelectTrigger
                  id="table_position"
                  disabled={!tableNumber || isDeclined}
                  className={`flex-1 ${isDeclined ? 'opacity-50' : ''}`}
                >
                  <SelectValue
                    placeholder={tableNumber ? 'Select seat' : 'Assign table first'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No seat assigned</SelectItem>
                  {availablePrimarySeats.map((pos) => (
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
                disabled={!tableNumber || isDeclined || !guestId}
                onClick={() => setIsArrangeModalOpen(true)}
                title={guestId ? 'Arrange seats visually' : 'Save guest first to use visual arrangement'}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
            {!tableNumber && (
              <p className="text-sm text-gray-500">
                Assign a table first to select a seat position.
              </p>
            )}
          </div>

          {/* Current Assignment Display */}
          {tableNumber && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Current Assignment</p>
              <p className="text-lg text-[#5C4B4B]">
                Table {tableNumber}
                {tablePosition && `, Seat ${tablePosition}`}
              </p>
            </div>
          )}
        </div>

        {/* Plus One Seating */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Plus One Seating
          </h3>

          {hasPlusOne ? (
            <>
              {/* Plus One Table (locked to primary) */}
              <div className="space-y-2">
                <Label>Table Number</Label>
                <Select
                  value={tableNumber || '__none__'}
                  disabled
                >
                  <SelectTrigger className="opacity-60">
                    <SelectValue placeholder="No table assigned">
                      {tableNumber ? `Table ${tableNumber} (same as primary)` : 'No table assigned'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No table assigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plus One Seat Position */}
              <div className="space-y-2">
                <Label htmlFor="plus_one_table_position">Seat Position</Label>
                <div className="flex gap-2">
                  <Select
                    value={plusOneTablePosition?.toString() || '__none__'}
                    onValueChange={(value) =>
                      setValue(
                        'plus_one_table_position',
                        value === '__none__' ? null : parseInt(value, 10)
                      )
                    }
                    disabled={!tableNumber || isDeclined}
                  >
                    <SelectTrigger
                      id="plus_one_table_position"
                      disabled={!tableNumber || isDeclined}
                      className={`flex-1 ${isDeclined ? 'opacity-50' : ''}`}
                    >
                      <SelectValue
                        placeholder={tableNumber ? 'Select seat' : 'Assign table first'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No seat assigned</SelectItem>
                      {availablePlusOneSeats.map((pos) => (
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
                    disabled={!tableNumber || isDeclined || !guestId}
                    onClick={() => setIsArrangeModalOpen(true)}
                    title={guestId ? 'Arrange seats visually' : 'Save guest first to use visual arrangement'}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
                {!tableNumber && (
                  <p className="text-sm text-gray-500">
                    Assign a table first to select a seat position.
                  </p>
                )}
              </div>

              {/* Plus One Current Assignment */}
              {tableNumber && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Current Assignment</p>
                  <p className="text-lg text-[#5C4B4B]">
                    Table {tableNumber}
                    {plusOneTablePosition && `, Seat ${plusOneTablePosition}`}
                  </p>
                </div>
              )}
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

      {/* Visual Seating Arrangement Modal */}
      {tableNumber && guestId && (
        <SeatingArrangeModal
          open={isArrangeModalOpen}
          onOpenChange={setIsArrangeModalOpen}
          tableNumber={tableNumber}
          currentGuestId={guestId}
          currentGuestName={guestName || form.getValues('name') || 'Guest'}
          currentPosition={tablePosition ?? null}
          seatedGuests={seatedGuests}
          onSelectPosition={handleSelectPosition}
          hasPlusOne={hasPlusOne}
          plusOneName={plusOneName || undefined}
          currentPlusOnePosition={plusOneTablePosition ?? null}
          onSelectPlusOnePosition={handleSelectPlusOnePosition}
        />
      )}
      </>
      )}
    </div>
  );
}
