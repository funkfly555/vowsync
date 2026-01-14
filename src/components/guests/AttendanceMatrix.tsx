/**
 * AttendanceMatrix - Modal container for attendance matrix view
 * @feature 007-guest-crud-attendance
 * @task T044, T047, T048
 */

import { useState, useCallback, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAttendanceMatrix } from '@/hooks/useAttendanceMatrix';
import { AttendanceMatrixRow } from './AttendanceMatrixRow';
import { AttendanceMatrixMobile } from './AttendanceMatrixMobile';
import {
  AttendanceMatrixGuest,
  GuestEventAttendance,
  EventAttendanceFormData,
} from '@/types/guest';
import { format } from 'date-fns';

interface AttendanceMatrixProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
}

export function AttendanceMatrix({ open, onOpenChange, weddingId }: AttendanceMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, Map<string, Partial<GuestEventAttendance>>>
  >(new Map());

  const { data, isLoading, isError, saveAttendance } = useAttendanceMatrix({ weddingId });

  // Apply pending changes to the guest data for display
  const displayGuests = useMemo<AttendanceMatrixGuest[]>(() => {
    if (!data?.guests) return [];

    return data.guests.map((guest) => {
      const guestChanges = pendingChanges.get(guest.id);
      if (!guestChanges) return guest;

      const updatedEventAttendance = { ...guest.eventAttendance };
      guestChanges.forEach((changes, eventId) => {
        updatedEventAttendance[eventId] = {
          ...updatedEventAttendance[eventId],
          ...changes,
        };
      });

      return {
        ...guest,
        eventAttendance: updatedEventAttendance,
      };
    });
  }, [data?.guests, pendingChanges]);

  // Filter guests by search term
  const filteredGuests = useMemo(() => {
    if (!searchTerm) return displayGuests;
    return displayGuests.filter((guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayGuests, searchTerm]);

  // Calculate event totals
  const eventTotals = useMemo(() => {
    const totals: Record<string, { attending: number; shuttleTo: number; shuttleFrom: number }> =
      {};

    if (!data?.events) return totals;

    data.events.forEach((event) => {
      totals[event.id] = { attending: 0, shuttleTo: 0, shuttleFrom: 0 };
    });

    displayGuests.forEach((guest) => {
      Object.entries(guest.eventAttendance).forEach(([eventId, attendance]) => {
        if (totals[eventId]) {
          if (attendance.attending) {
            totals[eventId].attending++;
            if (attendance.shuttle_to_event) totals[eventId].shuttleTo++;
            if (attendance.shuttle_from_event) totals[eventId].shuttleFrom++;
          }
        }
      });
    });

    return totals;
  }, [data?.events, displayGuests]);

  // Handle attendance field change
  const handleAttendanceChange = useCallback(
    (guestId: string, eventId: string, field: keyof GuestEventAttendance, value: boolean | string | null) => {
      setPendingChanges((prev) => {
        const next = new Map(prev);
        const guestChanges = new Map(next.get(guestId) || new Map());

        const currentChanges = guestChanges.get(eventId) || {};
        const updatedChanges: Partial<GuestEventAttendance> = {
          ...currentChanges,
          [field]: value,
        };

        // If unchecking attending, also clear shuttle fields
        if (field === 'attending' && !value) {
          updatedChanges.shuttle_to_event = null;
          updatedChanges.shuttle_from_event = null;
        }

        guestChanges.set(eventId, updatedChanges);
        next.set(guestId, guestChanges);
        return next;
      });
    },
    []
  );

  // Save all pending changes
  const handleSave = async () => {
    if (pendingChanges.size === 0) {
      toast.info('No changes to save');
      return;
    }

    // Build change payload
    const changes: { guestId: string; attendance: EventAttendanceFormData[] }[] = [];

    pendingChanges.forEach((guestChanges, guestId) => {
      const guest = displayGuests.find((g) => g.id === guestId);
      if (!guest) return;

      const attendance: EventAttendanceFormData[] = [];
      guestChanges.forEach((fieldChanges, eventId) => {
        const current = guest.eventAttendance[eventId] || {
          event_id: eventId,
          attending: false,
          shuttle_to_event: null,
          shuttle_from_event: null,
          notes: null,
        };

        attendance.push({
          event_id: eventId,
          attending: fieldChanges.attending ?? current.attending,
          shuttle_to_event: fieldChanges.shuttle_to_event ?? current.shuttle_to_event,
          shuttle_from_event: fieldChanges.shuttle_from_event ?? current.shuttle_from_event,
          notes: current.notes,
        });
      });

      if (attendance.length > 0) {
        changes.push({ guestId, attendance });
      }
    });

    try {
      await saveAttendance.mutateAsync(changes);
      toast.success('Attendance saved successfully');
      setPendingChanges(new Map());
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance. Please try again.');
    }
  };

  // Check if there are unsaved changes
  const hasChanges = pendingChanges.size > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] w-full overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Event Attendance Matrix</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">Error loading attendance data. Please try again.</p>
          </div>
        )}

        {/* Matrix Content */}
        {!isLoading && !isError && data && (
          <>
            {/* Desktop Table View - hidden on mobile */}
            <div className="hidden md:block flex-1 overflow-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    <th className="sticky left-0 bg-gray-100 px-4 py-3 text-left font-medium text-gray-700 border-b border-r border-[#E8E8E8] min-w-[180px]">
                      Guest
                    </th>
                    {data.events.map((event) => (
                      <th
                        key={event.id}
                        className="px-4 py-3 text-center font-medium text-gray-700 border-b border-r border-[#E8E8E8] last:border-r-0 min-w-[120px]"
                      >
                        <div className="flex flex-col">
                          <span>{event.event_name}</span>
                          {event.event_date && (
                            <span className="text-xs text-gray-500 font-normal">
                              {format(new Date(event.event_date), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => (
                    <AttendanceMatrixRow
                      key={guest.id}
                      guest={guest}
                      events={data.events}
                      onAttendanceChange={handleAttendanceChange}
                    />
                  ))}
                </tbody>
                {/* Footer with totals */}
                <tfoot className="sticky bottom-0 bg-gray-100">
                  <tr className="border-t-2 border-[#E8E8E8]">
                    <td className="sticky left-0 bg-gray-100 px-4 py-3 font-medium text-gray-700 border-r border-[#E8E8E8]">
                      Total
                    </td>
                    {data.events.map((event) => {
                      const totals = eventTotals[event.id] || {
                        attending: 0,
                        shuttleTo: 0,
                        shuttleFrom: 0,
                      };
                      return (
                        <td
                          key={event.id}
                          className="px-4 py-3 text-center border-r border-[#E8E8E8] last:border-r-0"
                        >
                          <div className="flex flex-col text-sm">
                            <span className="font-medium">{totals.attending} attending</span>
                            {totals.attending > 0 && (
                              <span className="text-xs text-gray-500">
                                {totals.shuttleTo} shuttle to / {totals.shuttleFrom} shuttle from
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile View - hidden on desktop */}
            <div className="block md:hidden flex-1 overflow-auto">
              <AttendanceMatrixMobile
                guests={displayGuests}
                events={data.events}
                onAttendanceChange={handleAttendanceChange}
                searchTerm={searchTerm}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E8E8]">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saveAttendance.isPending}
              >
                {hasChanges ? 'Cancel' : 'Close'}
              </Button>
              {hasChanges && (
                <Button onClick={handleSave} disabled={saveAttendance.isPending}>
                  {saveAttendance.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
