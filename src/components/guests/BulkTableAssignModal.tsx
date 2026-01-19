/**
 * BulkTableAssignModal - Visual drag-and-drop table assignment
 * Left panel: Selected guests (draggable)
 * Right panel: Circular table seating visualization
 * @feature 021-guest-page-redesign
 */

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { User, Check, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { GuestCardDisplayItem, TABLE_NUMBERS } from '@/types/guest';
import { useGuestsByTable } from '@/hooks/useGuests';
import { useGuestMutations } from '@/hooks/useGuestMutations';

interface BulkTableAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  selectedGuests: GuestCardDisplayItem[];
  onComplete: () => void;
}

interface SeatInfo {
  position: number;
  guestId?: string;
  guestName?: string;
}

// Draggable Guest Item
function DraggableGuest({
  guest,
  isAssigned,
}: {
  guest: GuestCardDisplayItem;
  isAssigned: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2 p-2 bg-white border rounded-lg cursor-grab active:cursor-grabbing transition-colors',
        isDragging && 'opacity-50',
        isAssigned && 'border-[#D4A5A5] bg-[#FFF5F5]'
      )}
    >
      <GripVertical className="h-4 w-4 text-gray-400" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{guest.name}</p>
        {guest.table_number && (
          <p className="text-xs text-[#D4A5A5]">
            Currently: Table {guest.table_number}
            {guest.table_position && `, Seat ${guest.table_position}`}
          </p>
        )}
      </div>
      {isAssigned && <Check className="h-4 w-4 text-[#D4A5A5]" />}
    </div>
  );
}

// Droppable Seat
function DroppableSeat({
  seat,
  position,
  isSelected,
  isOver,
  seatSize,
}: {
  seat: SeatInfo;
  position: { x: number; y: number };
  isSelected: boolean;
  isOver: boolean;
  seatSize: number;
}) {
  const { setNodeRef, isOver: seatIsOver } = useDroppable({
    id: `seat-${seat.position}`,
    data: { seat },
  });

  const isOccupied = !!seat.guestId;
  const showOver = isOver || seatIsOver;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute rounded-full flex flex-col items-center justify-center transition-all',
        'border-2 text-xs font-medium',
        isOccupied
          ? 'bg-gray-200 border-gray-300 text-gray-600'
          : showOver
          ? 'bg-[#D4A5A5] border-[#c99595] text-white scale-110 shadow-lg'
          : isSelected
          ? 'bg-blue-100 border-blue-300 text-blue-700'
          : 'bg-white border-gray-300 text-gray-700 hover:border-[#D4A5A5] hover:bg-[#f9f0f0]'
      )}
      style={{
        width: seatSize,
        height: seatSize,
        left: `calc(50% + ${position.x}px - ${seatSize / 2}px)`,
        top: `calc(50% + ${position.y}px - ${seatSize / 2}px)`,
      }}
      title={
        isOccupied
          ? `Seat ${seat.position}: ${seat.guestName}`
          : `Seat ${seat.position}: Available`
      }
    >
      {isOccupied ? (
        <>
          <User className="h-3 w-3" />
          <span className="text-[8px] truncate max-w-[36px]">
            {seat.guestName?.split(' ')[0]}
          </span>
        </>
      ) : (
        <span>{seat.position}</span>
      )}
    </div>
  );
}

// Drag Overlay Item
function DragOverlayItem({ guest }: { guest: GuestCardDisplayItem }) {
  return (
    <div
      className="flex items-center gap-2 p-2 bg-white border-2 border-[#D4A5A5] rounded-lg shadow-lg"
      style={{ pointerEvents: 'none' }}
    >
      <User className="h-4 w-4 text-[#D4A5A5]" />
      <span className="font-medium text-sm">{guest.name}</span>
      {guest.has_plus_one && guest.plus_one_name && (
        <span className="text-xs text-gray-500">+1</span>
      )}
    </div>
  );
}

/**
 * Calculate the position of a seat around a circular table
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

export function BulkTableAssignModal({
  open,
  onOpenChange,
  weddingId,
  selectedGuests,
  onComplete,
}: BulkTableAssignModalProps) {
  const [selectedTable, setSelectedTable] = useState<string>(TABLE_NUMBERS[0]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<
    Map<string, { tableNumber: string; position: number }>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const { updateGuest } = useGuestMutations(weddingId);

  // Fetch guests currently at the selected table
  const { guests: seatedGuests } = useGuestsByTable(weddingId, selectedTable);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const maxSeats = 10;

  // Build seat information for the selected table
  const seats: SeatInfo[] = Array.from({ length: maxSeats }, (_, i) => {
    const position = i + 1;

    // Check if any selected guest is assigned to this position in our pending assignments
    const pendingAssignment = Array.from(assignments.entries()).find(
      ([, assignment]) =>
        assignment.tableNumber === selectedTable && assignment.position === position
    );

    // Check if there's a guest already seated at this position (not in our selection)
    const existingGuest = seatedGuests.find(
      (g) =>
        g.table_position === position &&
        !selectedGuests.some((sg) => sg.id === g.id) // Exclude selected guests
    );

    if (pendingAssignment) {
      const guest = selectedGuests.find((g) => g.id === pendingAssignment[0]);
      return {
        position,
        guestId: pendingAssignment[0],
        guestName: guest?.name,
      };
    }

    if (existingGuest) {
      return {
        position,
        guestId: existingGuest.id,
        guestName: existingGuest.name,
      };
    }

    return { position };
  });

  // Reset assignments when modal opens
  useEffect(() => {
    if (open) {
      // Initialize assignments from current guest data
      const initialAssignments = new Map<
        string,
        { tableNumber: string; position: number }
      >();
      selectedGuests.forEach((guest) => {
        if (guest.table_number && guest.table_position) {
          initialAssignments.set(guest.id, {
            tableNumber: guest.table_number,
            position: guest.table_position,
          });
        }
      });
      setAssignments(initialAssignments);
    }
  }, [open, selectedGuests]);

  // Get the currently dragged guest
  const activeGuest = activeId
    ? selectedGuests.find((g) => g.id === activeId)
    : null;

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as string | null;
    setOverId(overId);
  };

  // Handle drag end - assign guest to seat
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || !active) return;

    const guestId = active.id as string;
    const overIdStr = over.id as string;

    // Check if dropped on a seat
    if (!overIdStr.startsWith('seat-')) return;

    const seatPosition = parseInt(overIdStr.replace('seat-', ''), 10);
    const guest = selectedGuests.find((g) => g.id === guestId);

    if (!guest) return;

    // Check if the seat is occupied by someone not in our selection
    const existingGuest = seatedGuests.find(
      (g) =>
        g.table_position === seatPosition &&
        !selectedGuests.some((sg) => sg.id === g.id)
    );

    if (existingGuest) {
      toast.error(`Seat ${seatPosition} is occupied by ${existingGuest.name}`);
      return;
    }

    // Check if another selected guest has this seat pending
    const conflictingAssignment = Array.from(assignments.entries()).find(
      ([id, assignment]) =>
        id !== guestId &&
        assignment.tableNumber === selectedTable &&
        assignment.position === seatPosition
    );

    if (conflictingAssignment) {
      // Swap: remove the conflicting assignment
      const newAssignments = new Map(assignments);
      newAssignments.delete(conflictingAssignment[0]);
      newAssignments.set(guestId, {
        tableNumber: selectedTable,
        position: seatPosition,
      });
      setAssignments(newAssignments);

      toast.info(
        `Swapped: ${guest.name} → Seat ${seatPosition}, ${selectedGuests.find((g) => g.id === conflictingAssignment[0])?.name} unassigned`
      );
    } else {
      // Simple assignment
      const newAssignments = new Map(assignments);
      newAssignments.set(guestId, {
        tableNumber: selectedTable,
        position: seatPosition,
      });
      setAssignments(newAssignments);

      toast.success(`${guest.name} assigned to Table ${selectedTable}, Seat ${seatPosition}`);
    }
  };

  // Save all assignments
  const handleSaveAll = async () => {
    if (assignments.size === 0) {
      toast.info('No assignments to save');
      return;
    }

    setIsSaving(true);

    try {
      const promises = Array.from(assignments.entries()).map(
        ([guestId, assignment]) =>
          updateGuest.mutateAsync({
            guest_id: guestId,
            data: {
              table_number: assignment.tableNumber,
              table_position: assignment.position,
            },
          })
      );

      await Promise.all(promises);

      toast.success(`Saved ${assignments.size} seating assignments`);
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast.error('Failed to save some assignments. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Clear assignment for a guest
  const handleClearAssignment = (guestId: string) => {
    const newAssignments = new Map(assignments);
    newAssignments.delete(guestId);
    setAssignments(newAssignments);
  };

  // Circle dimensions
  const tableSize = 100;
  const seatRadius = 110;
  const seatSize = 44;
  const containerSize = seatRadius * 2 + seatSize + 20;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Seats</DialogTitle>
          <DialogDescription>
            Drag guests from the left panel to seats on the table. Assignments are
            saved when you click "Save All".
          </DialogDescription>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          modifiers={[snapCenterToCursor]}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-hidden">
            {/* Left Panel: Selected Guests */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">
                  Selected Guests ({selectedGuests.length})
                </h3>
                <span className="text-xs text-gray-500">
                  {assignments.size} assigned
                </span>
              </div>
              <ScrollArea className="flex-1 h-[350px] pr-3">
                <div className="space-y-2">
                  {selectedGuests.map((guest) => {
                    const assignment = assignments.get(guest.id);
                    const isAssigned = !!assignment;

                    return (
                      <div key={guest.id} className="relative">
                        <DraggableGuest guest={guest} isAssigned={isAssigned} />
                        {isAssigned && (
                          <button
                            onClick={() => handleClearAssignment(guest.id)}
                            className="absolute -right-1 -top-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                            title="Clear assignment"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel: Table Visualization */}
            <div className="flex flex-col">
              {/* Table Selector */}
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-medium">Table:</label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TABLE_NUMBERS.map((num) => (
                      <SelectItem key={num} value={num}>
                        Table {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Circular Table Visualization */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="relative"
                  style={{
                    width: containerSize,
                    height: containerSize,
                  }}
                >
                  {/* Table (center circle) */}
                  <div
                    className="absolute bg-[#5C4B4B] rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      width: tableSize,
                      height: tableSize,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    Table {selectedTable}
                  </div>

                  {/* Seats around the table */}
                  {seats.map((seat) => {
                    const pos = getSeatPosition(seat.position, maxSeats, seatRadius);
                    const isOver =
                      overId === `seat-${seat.position}` && !seat.guestId;

                    return (
                      <DroppableSeat
                        key={seat.position}
                        seat={seat}
                        position={pos}
                        isSelected={false}
                        isOver={isOver}
                        seatSize={seatSize}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-300" />
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-gray-300" />
                  <span className="text-gray-600">Occupied</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#D4A5A5] border-2 border-[#c99595]" />
                  <span className="text-gray-600">Drop Here</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeGuest ? <DragOverlayItem guest={activeGuest} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignments(new Map())}
              disabled={assignments.size === 0}
            >
              Clear All
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={assignments.size === 0 || isSaving}
              className="bg-[#D4A5A5] hover:bg-[#c99595]"
            >
              {isSaving ? 'Saving...' : `Save All (${assignments.size})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
