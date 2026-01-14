/**
 * AttendanceMatrixMobile - Mobile view for attendance matrix with event selector
 * @feature 007-guest-crud-attendance
 * @task T043
 */

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AttendanceMatrixGuest, AttendanceMatrixEvent, GuestEventAttendance } from '@/types/guest';
import { format } from 'date-fns';

interface AttendanceMatrixMobileProps {
  guests: AttendanceMatrixGuest[];
  events: AttendanceMatrixEvent[];
  onAttendanceChange: (
    guestId: string,
    eventId: string,
    field: keyof GuestEventAttendance,
    value: boolean | string | null
  ) => void;
  searchTerm: string;
}

export function AttendanceMatrixMobile({
  guests,
  events,
  onAttendanceChange,
  searchTerm,
}: AttendanceMatrixMobileProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Filter guests by search term
  const filteredGuests = guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate attending count for selected event
  const attendingCount = filteredGuests.filter(
    (guest) => guest.eventAttendance[selectedEventId]?.attending
  ).length;

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No events found for this wedding.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Event Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Event</label>
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.event_name}
                {event.event_date && (
                  <span className="text-gray-500 ml-2">
                    ({format(new Date(event.event_date), 'MMM d, yyyy')})
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Event Summary */}
      {selectedEvent && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <span className="font-medium">{selectedEvent.event_name}</span>
          <span className="text-gray-500 ml-2">
            {attendingCount} / {filteredGuests.length} attending
          </span>
        </div>
      )}

      {/* Guest List for Selected Event */}
      <div className="space-y-2">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No guests match your search.
          </div>
        ) : (
          filteredGuests.map((guest) => {
            const attendance = guest.eventAttendance[selectedEventId] || {
              event_id: selectedEventId,
              attending: false,
              shuttle_to_event: null,
              shuttle_from_event: null,
              notes: null,
            };

            return (
              <div
                key={guest.id}
                className="border border-[#E8E8E8] rounded-lg p-4 bg-white"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{guest.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{guest.guest_type}</p>
                    </div>

                    {/* Attending checkbox */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`mobile-${guest.id}-attending`}
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        Attending
                      </label>
                      <Checkbox
                        id={`mobile-${guest.id}-attending`}
                        checked={attendance.attending}
                        onCheckedChange={(checked) =>
                          onAttendanceChange(
                            guest.id,
                            selectedEventId,
                            'attending',
                            checked === true
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Shuttle options - only show if attending */}
                  {attendance.attending && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor={`mobile-${guest.id}-shuttle-to`}
                          className="text-gray-500"
                        >
                          Shuttle to
                        </label>
                        <Input
                          id={`mobile-${guest.id}-shuttle-to`}
                          value={attendance.shuttle_to_event || ''}
                          onChange={(e) =>
                            onAttendanceChange(
                              guest.id,
                              selectedEventId,
                              'shuttle_to_event',
                              e.target.value || null
                            )
                          }
                          placeholder="e.g., Bus A"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor={`mobile-${guest.id}-shuttle-from`}
                          className="text-gray-500"
                        >
                          Shuttle from
                        </label>
                        <Input
                          id={`mobile-${guest.id}-shuttle-from`}
                          value={attendance.shuttle_from_event || ''}
                          onChange={(e) =>
                            onAttendanceChange(
                              guest.id,
                              selectedEventId,
                              'shuttle_from_event',
                              e.target.value || null
                            )
                          }
                          placeholder="e.g., Bus A"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
