/**
 * AttendanceMatrixRow - Single row in attendance matrix with checkboxes and shuttle inputs
 * @feature 007-guest-crud-attendance
 * @task T042
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AttendanceMatrixGuest, AttendanceMatrixEvent, GuestEventAttendance } from '@/types/guest';

interface AttendanceMatrixRowProps {
  guest: AttendanceMatrixGuest;
  events: AttendanceMatrixEvent[];
  onAttendanceChange: (
    guestId: string,
    eventId: string,
    field: keyof GuestEventAttendance,
    value: boolean | string | null
  ) => void;
}

export function AttendanceMatrixRow({
  guest,
  events,
  onAttendanceChange,
}: AttendanceMatrixRowProps) {
  return (
    <tr className="border-b border-[#E8E8E8] hover:bg-gray-50">
      {/* Guest Name - sticky first column */}
      <td className="sticky left-0 bg-white px-4 py-3 font-medium text-gray-900 min-w-[180px] border-r border-[#E8E8E8]">
        <div className="flex flex-col">
          <span className="truncate">{guest.name}</span>
          <span className="text-xs text-gray-500 capitalize">{guest.guest_type}</span>
        </div>
      </td>

      {/* Event columns with attendance checkboxes */}
      {events.map((event) => {
        const attendance = guest.eventAttendance[event.id] || {
          event_id: event.id,
          attending: false,
          shuttle_to_event: null,
          shuttle_from_event: null,
          notes: null,
        };

        return (
          <td
            key={event.id}
            className="px-4 py-3 text-center min-w-[180px] border-r border-[#E8E8E8] last:border-r-0"
          >
            <div className="flex flex-col items-center gap-2">
              {/* Attending checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${guest.id}-${event.id}-attending`}
                  checked={attendance.attending}
                  onCheckedChange={(checked) =>
                    onAttendanceChange(guest.id, event.id, 'attending', checked === true)
                  }
                />
                <label
                  htmlFor={`${guest.id}-${event.id}-attending`}
                  className="text-xs text-gray-600 cursor-pointer"
                >
                  Attending
                </label>
              </div>

              {/* Shuttle fields - only show if attending */}
              {attendance.attending && (
                <div className="flex flex-col gap-2 w-full text-xs">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`${guest.id}-${event.id}-shuttle-to`}
                      className="text-gray-500 text-left"
                    >
                      Shuttle to
                    </label>
                    <Input
                      id={`${guest.id}-${event.id}-shuttle-to`}
                      value={attendance.shuttle_to_event || ''}
                      onChange={(e) =>
                        onAttendanceChange(
                          guest.id,
                          event.id,
                          'shuttle_to_event',
                          e.target.value || null
                        )
                      }
                      placeholder="e.g., Bus A, Car 1"
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`${guest.id}-${event.id}-shuttle-from`}
                      className="text-gray-500 text-left"
                    >
                      Shuttle from
                    </label>
                    <Input
                      id={`${guest.id}-${event.id}-shuttle-from`}
                      value={attendance.shuttle_from_event || ''}
                      onChange={(e) =>
                        onAttendanceChange(
                          guest.id,
                          event.id,
                          'shuttle_from_event',
                          e.target.value || null
                        )
                      }
                      placeholder="e.g., Bus A, Car 1"
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}
