/**
 * GuestSeatingTab - Tab 3: Table Seating Assignment
 * @feature 024-guest-menu-management
 *
 * Fields: Table Number, Seat Position
 * Plus One: Shows same table assignment
 */

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UserPlus, Grid3X3, AlertCircle } from 'lucide-react';
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

interface GuestSeatingTabProps {
  form: UseFormReturn<GuestFormData>;
}

const SEAT_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function GuestSeatingTab({ form }: GuestSeatingTabProps) {
  const { setValue, watch } = form;
  const [, setIsArrangeModalOpen] = useState(false);

  const tableNumber = watch('table_number') as string | null | undefined;
  const tablePosition = watch('table_position') as number | null | undefined;
  const hasPlusOne = watch('has_plus_one');
  const plusOneName = watch('plus_one_name');
  const invitationStatus = watch('invitation_status');

  const isDeclined = invitationStatus === 'declined';

  return (
    <div className="space-y-6">
      {isDeclined && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This guest has declined the invitation. Seating assignments are disabled.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Assign table and seat position. Plus ones are seated at the same table.
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
              onValueChange={(value) =>
                setValue('table_number', value === '__none__' ? null : value)
              }
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
                disabled={!tableNumber || isDeclined}
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
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p>
                  Plus ones are automatically seated at the same table as the primary
                  guest.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg text-center">
              <UserPlus className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No plus one for this guest.</p>
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
