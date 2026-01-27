/**
 * SeatingArrangeModal - Visual circular table seating arrangement
 * Shows numbered positions around a circular table for seat assignment
 * Supports two-step flow for primary guest + plus one
 * @feature 033-guest-page-tweaks
 */

import { useState, useEffect } from 'react';
import { User, Check, UserPlus } from 'lucide-react';
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
  /** Plus one support */
  hasPlusOne?: boolean;
  plusOneName?: string;
  currentPlusOnePosition?: number | null;
  onSelectPlusOnePosition?: (position: number | null) => void;
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
  const angleOffset = -90;
  const angleDeg = angleOffset + ((seatNumber - 1) / totalSeats) * 360;
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    x: Math.cos(angleRad) * radius,
    y: Math.sin(angleRad) * radius,
  };
}

type AssignmentStep = 'primary' | 'plusone';

export function SeatingArrangeModal({
  open,
  onOpenChange,
  tableNumber,
  currentGuestId,
  currentGuestName,
  currentPosition,
  seatedGuests,
  onSelectPosition,
  hasPlusOne = false,
  plusOneName,
  currentPlusOnePosition = null,
  onSelectPlusOnePosition,
  maxSeats = 10,
}: SeatingArrangeModalProps) {
  const showPlusOneFlow = hasPlusOne && !!onSelectPlusOnePosition;

  const [step, setStep] = useState<AssignmentStep>('primary');
  const [selectedPrimary, setSelectedPrimary] = useState<number | null>(currentPosition);
  const [selectedPlusOne, setSelectedPlusOne] = useState<number | null>(currentPlusOnePosition);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('primary');
      setSelectedPrimary(currentPosition);
      setSelectedPlusOne(currentPlusOnePosition);
    }
  }, [open, currentPosition, currentPlusOnePosition]);

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

  const isSeatAvailable = (position: number): boolean => {
    const seat = seats.find((s) => s.position === position);
    // Occupied by another guest
    if (seat?.guestId && seat.guestId !== currentGuestId) return false;
    // During plus one step, can't pick the primary's selected seat
    if (step === 'plusone' && selectedPrimary === position) return false;
    // During primary step, can't pick the plus one's selected seat
    if (step === 'primary' && showPlusOneFlow && selectedPlusOne === position) return false;
    return true;
  };

  const handleSeatClick = (position: number) => {
    if (!isSeatAvailable(position)) return;

    if (step === 'primary') {
      setSelectedPrimary(selectedPrimary === position ? null : position);
    } else {
      setSelectedPlusOne(selectedPlusOne === position ? null : position);
    }
  };

  const handleConfirm = () => {
    onSelectPosition(selectedPrimary);
    if (showPlusOneFlow && onSelectPlusOnePosition) {
      onSelectPlusOnePosition(selectedPlusOne);
    }
    onOpenChange(false);
  };

  const handleNext = () => {
    setStep('plusone');
  };

  const handleBack = () => {
    setStep('primary');
  };

  const handleClear = () => {
    if (step === 'primary') {
      setSelectedPrimary(null);
    } else {
      setSelectedPlusOne(null);
    }
  };

  const handleClearAll = () => {
    setSelectedPrimary(null);
    setSelectedPlusOne(null);
  };

  // Circle dimensions
  const tableSize = 120;
  const seatRadius = 140;
  const seatSize = 48;
  const containerSize = seatRadius * 2 + seatSize + 20;

  const displayPlusOneName = plusOneName || 'Plus One';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arrange Seats - Table {tableNumber}</DialogTitle>
          <DialogDescription>
            {showPlusOneFlow
              ? `Assign seats for ${currentGuestName} and ${displayPlusOneName}.`
              : <>Click a seat to assign <strong>{currentGuestName}</strong> to that position.</>
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step indicator - only shown when plus one flow */}
          {showPlusOneFlow && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                step === 'primary'
                  ? 'bg-[#D4A5A5]/15 text-[#5C4B4B] border border-[#D4A5A5]'
                  : 'bg-[#D4A5A5] text-white'
              )}>
                {step !== 'primary' && <Check className="h-3 w-3" />}
                <span>1. Primary</span>
              </div>
              <div className={cn(
                'w-6 h-px',
                step === 'plusone' ? 'bg-[#A8B8A6]' : 'bg-gray-200'
              )} />
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                step === 'plusone'
                  ? 'bg-[#A8B8A6]/15 text-[#3d5a3a] border border-[#A8B8A6]'
                  : 'bg-gray-100 text-gray-400'
              )}>
                <span>2. Plus One</span>
              </div>
            </div>
          )}

          {/* Current assignment mode banner */}
          {showPlusOneFlow && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-sm font-medium',
              step === 'primary'
                ? 'bg-[#D4A5A5]/10 border border-[#D4A5A5]/30 text-[#5C4B4B]'
                : 'bg-[#A8B8A6]/10 border border-[#A8B8A6]/30 text-[#3d5a3a]'
            )}>
              {step === 'primary' ? (
                <>
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>Assigning: <strong>{currentGuestName}</strong></span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 flex-shrink-0" />
                  <span>Assigning: <strong>{displayPlusOneName}</strong></span>
                </>
              )}
            </div>
          )}

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
              const isOccupiedByOther = !!seat.guestId && seat.guestId !== currentGuestId;
              const isPrimarySelected = selectedPrimary === seat.position;
              const isPlusOneSelected = selectedPlusOne === seat.position;
              const isCurrentPrimarySeat = currentPosition === seat.position && !isOccupiedByOther;
              const available = isSeatAvailable(seat.position);

              // Determine seat styling
              let seatClass: string;
              let seatContent: React.ReactNode;

              if (isOccupiedByOther) {
                seatClass = 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed';
                seatContent = (
                  <>
                    <User className="h-4 w-4" />
                    <span className="text-[9px] truncate max-w-[40px]">
                      {seat.guestName?.split(' ')[0]}
                    </span>
                  </>
                );
              } else if (isPrimarySelected) {
                seatClass = 'bg-[#D4A5A5] border-[#c99595] text-white shadow-lg scale-110';
                seatContent = (
                  <>
                    <Check className="h-4 w-4" />
                    {showPlusOneFlow && (
                      <span className="text-[9px]">{currentGuestName.split(' ')[0]}</span>
                    )}
                  </>
                );
              } else if (isPlusOneSelected) {
                seatClass = 'bg-[#A8B8A6] border-[#8fa88d] text-white shadow-lg scale-110';
                seatContent = (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="text-[9px]">{displayPlusOneName.split(' ')[0]}</span>
                  </>
                );
              } else if (isCurrentPrimarySeat && !isPrimarySelected) {
                seatClass = 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200';
                seatContent = <span>{seat.position}</span>;
              } else if (!available) {
                seatClass = 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed';
                seatContent = <span>{seat.position}</span>;
              } else {
                seatClass = 'bg-white border-gray-300 text-gray-700 hover:border-[#D4A5A5] hover:bg-[#f9f0f0]';
                seatContent = <span>{seat.position}</span>;
              }

              return (
                <button
                  key={seat.position}
                  type="button"
                  onClick={() => handleSeatClick(seat.position)}
                  disabled={isOccupiedByOther || !available}
                  className={cn(
                    'absolute rounded-full flex flex-col items-center justify-center transition-all',
                    'border-2 text-xs font-medium',
                    seatClass
                  )}
                  style={{
                    width: seatSize,
                    height: seatSize,
                    left: `calc(50% + ${x}px - ${seatSize / 2}px)`,
                    top: `calc(50% + ${y}px - ${seatSize / 2}px)`,
                  }}
                  title={
                    isOccupiedByOther
                      ? `Seat ${seat.position}: ${seat.guestName}`
                      : isPrimarySelected
                      ? `Seat ${seat.position}: ${currentGuestName}`
                      : isPlusOneSelected
                      ? `Seat ${seat.position}: ${displayPlusOneName}`
                      : `Seat ${seat.position}: Available`
                  }
                  aria-label={
                    isOccupiedByOther
                      ? `Seat ${seat.position}, occupied by ${seat.guestName}`
                      : isPrimarySelected
                      ? `Seat ${seat.position}, assigned to ${currentGuestName}`
                      : isPlusOneSelected
                      ? `Seat ${seat.position}, assigned to ${displayPlusOneName}`
                      : `Seat ${seat.position}, available`
                  }
                >
                  {seatContent}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-300" />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200 border-2 border-gray-300" />
              <span className="text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#D4A5A5] border-2 border-[#c99595]" />
              <span className="text-gray-600">{showPlusOneFlow ? 'Primary' : 'Selected'}</span>
            </div>
            {showPlusOneFlow && (
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#A8B8A6] border-2 border-[#8fa88d]" />
                <span className="text-gray-600">Plus One</span>
              </div>
            )}
          </div>

          {/* Preview bar */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D4A5A5] flex-shrink-0" />
              {selectedPrimary ? (
                <p><strong>{currentGuestName}</strong> → Seat {selectedPrimary}</p>
              ) : (
                <p className="text-gray-400">{currentGuestName} → Not assigned</p>
              )}
            </div>
            {showPlusOneFlow && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  selectedPlusOne ? 'bg-[#A8B8A6]' : 'bg-gray-300'
                )} />
                {selectedPlusOne ? (
                  <p><strong>{displayPlusOneName}</strong> → Seat {selectedPlusOne}</p>
                ) : (
                  <p className="text-gray-400">{displayPlusOneName} → Not assigned</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-2">
          {showPlusOneFlow ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={!selectedPrimary && !selectedPlusOne}
              >
                Clear All
              </Button>
              <div className="flex gap-2">
                {step === 'primary' ? (
                  <>
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleNext}
                      className="bg-[#D4A5A5] hover:bg-[#c99595]"
                    >
                      Next: Plus One →
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" size="sm" onClick={handleBack}>
                      ← Back
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConfirm}
                      className="bg-[#A8B8A6] hover:bg-[#8fa88d]"
                    >
                      Confirm Both
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={!selectedPrimary}
              >
                Clear Position
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  className="bg-[#D4A5A5] hover:bg-[#c99595]"
                >
                  Confirm
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
