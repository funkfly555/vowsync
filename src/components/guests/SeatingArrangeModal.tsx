/**
 * SeatingArrangeModal - Visual circular table seating arrangement
 * Shows numbered positions around a circular table for seat assignment
 * @feature 021-guest-page-redesign
 * @task T047-T052, T054
 */

import { useState, useEffect } from 'react';
import { User, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SeatInfo {
  position: number;
  guestId?: string;
  guestName?: string;
}

interface SeatingArrangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableNumber: string;
  currentGuestId: string;
  currentGuestName: string;
  currentPosition: number | null;
  /** Guests already seated at this table */
  seatedGuests: Array<{
    id: string;
    name: string;
    table_position: number | null;
  }>;
  onSelectPosition: (position: number | null) => void;
  maxSeats?: number;
}

/**
 * Calculate the position of a seat around a circular table
 * @param seatNumber 1-indexed seat number
 * @param totalSeats Total number of seats
 * @param radius Radius of the circle in pixels
 * @returns { x, y } position relative to center
 */
function getSeatPosition(
  seatNumber: number,
  totalSeats: number,
  radius: number
): { x: number; y: number } {
  // Start from top (12 o'clock) and go clockwise
  // Angle starts at -90° (top) and increases clockwise
  const angleOffset = -90; // Start from top
  const angleDeg = angleOffset + ((seatNumber - 1) / totalSeats) * 360;
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    x: Math.cos(angleRad) * radius,
    y: Math.sin(angleRad) * radius,
  };
}

export function SeatingArrangeModal({
  open,
  onOpenChange,
  tableNumber,
  currentGuestId,
  currentGuestName,
  currentPosition,
  seatedGuests,
  onSelectPosition,
  maxSeats = 10,
}: SeatingArrangeModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(currentPosition);

  // Reset selected position when modal opens
  useEffect(() => {
    if (open) {
      setSelectedPosition(currentPosition);
    }
  }, [open, currentPosition]);

  // Build seat information array
  const seats: SeatInfo[] = Array.from({ length: maxSeats }, (_, i) => {
    const position = i + 1;
    const seatedGuest = seatedGuests.find(
      (g) => g.table_position === position && g.id !== currentGuestId
    );

    return {
      position,
      guestId: seatedGuest?.id,
      guestName: seatedGuest?.name,
    };
  });

  const handleSeatClick = (position: number) => {
    // Can't select occupied seats (unless it's the current guest's seat)
    const seat = seats.find((s) => s.position === position);
    if (seat?.guestId && seat.guestId !== currentGuestId) {
      return;
    }

    // Toggle selection
    if (selectedPosition === position) {
      setSelectedPosition(null);
    } else {
      setSelectedPosition(position);
    }
  };

  const handleConfirm = () => {
    onSelectPosition(selectedPosition);
    onOpenChange(false);
  };

  const handleClearPosition = () => {
    setSelectedPosition(null);
  };

  // Circle dimensions
  const tableSize = 120; // Table diameter
  const seatRadius = 140; // Distance from center to seats
  const seatSize = 48; // Seat button size
  const containerSize = seatRadius * 2 + seatSize + 20; // Total container size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arrange Seats - Table {tableNumber}</DialogTitle>
          <DialogDescription>
            Click a seat to assign <strong>{currentGuestName}</strong> to that position.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Circular Table Visualization */}
          <div
            className="relative mx-auto"
            style={{
              width: containerSize,
              height: containerSize,
            }}
          >
            {/* Table (center circle) */}
            <div
              className="absolute bg-[#5C4B4B] rounded-full flex items-center justify-center text-white font-bold"
              style={{
                width: tableSize,
                height: tableSize,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              Table {tableNumber}
            </div>

            {/* Seats around the table */}
            {seats.map((seat) => {
              const { x, y } = getSeatPosition(seat.position, maxSeats, seatRadius);
              const isOccupied = !!seat.guestId;
              const isSelected = selectedPosition === seat.position;
              const isCurrentGuest =
                currentPosition === seat.position && !isOccupied;

              return (
                <button
                  key={seat.position}
                  onClick={() => handleSeatClick(seat.position)}
                  disabled={isOccupied}
                  className={cn(
                    'absolute rounded-full flex flex-col items-center justify-center transition-all',
                    'border-2 text-xs font-medium',
                    isOccupied
                      ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#D4A5A5] border-[#c99595] text-white shadow-lg scale-110'
                      : isCurrentGuest
                      ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-[#D4A5A5] hover:bg-[#f9f0f0]'
                  )}
                  style={{
                    width: seatSize,
                    height: seatSize,
                    left: `calc(50% + ${x}px - ${seatSize / 2}px)`,
                    top: `calc(50% + ${y}px - ${seatSize / 2}px)`,
                  }}
                  title={
                    isOccupied
                      ? `Seat ${seat.position}: ${seat.guestName}`
                      : `Seat ${seat.position}: Available`
                  }
                  aria-label={
                    isOccupied
                      ? `Seat ${seat.position}, occupied by ${seat.guestName}`
                      : `Seat ${seat.position}, available`
                  }
                >
                  {isSelected ? (
                    <Check className="h-4 w-4" />
                  ) : isOccupied ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <span>{seat.position}</span>
                  )}
                  {isOccupied && (
                    <span className="text-[9px] truncate max-w-[40px]">
                      {seat.guestName?.split(' ')[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300" />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-300" />
              <span className="text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#D4A5A5] border-2 border-[#c99595]" />
              <span className="text-gray-600">Selected</span>
            </div>
          </div>

          {/* Current selection info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center text-sm">
            {selectedPosition ? (
              <p>
                <strong>{currentGuestName}</strong> will be assigned to{' '}
                <strong>Seat {selectedPosition}</strong>
              </p>
            ) : (
              <p className="text-gray-500">
                No seat selected. {currentGuestName} will have no seat assignment.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleClearPosition}
            disabled={!selectedPosition}
          >
            Clear Position
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-[#D4A5A5] hover:bg-[#c99595]"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
