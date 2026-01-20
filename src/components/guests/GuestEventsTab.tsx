/**
 * GuestEventsTab - Tab 5: Event Attendance
 * @feature 007-guest-crud-attendance
 *
 * Lists wedding events with attendance checkbox and shuttle text inputs (conditional)
 */

import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { GuestFormData, EventAttendanceFormData } from '@/types/guest';
import { useWeddingEventsForAttendance } from '@/hooks/useGuests';

interface GuestEventsTabProps {
  form: UseFormReturn<GuestFormData>;
  weddingId: string;
}

interface EventWithDetails {
  id: string;
  event_name: string;
  event_order: number;
  event_date: string | null;
}

export function GuestEventsTab({ form, weddingId }: GuestEventsTabProps) {
  const { setValue, watch } = form;
  const eventAttendance = watch('event_attendance');
  const invitationStatus = watch('invitation_status');

  const isDeclined = invitationStatus === 'declined';

  const { data: events, isLoading } = useWeddingEventsForAttendance(weddingId);

  // Initialize event_attendance array when events load
  useEffect(() => {
    if (events && events.length > 0 && eventAttendance.length === 0) {
      const initialAttendance: EventAttendanceFormData[] = events.map(
        (event: EventWithDetails) => ({
          event_id: event.id,
          attending: false,
          shuttle_to_event: null,
          shuttle_from_event: null,
          notes: null,
        })
      );
      setValue('event_attendance', initialAttendance);
    }
  }, [events, eventAttendance.length, setValue]);

  const getAttendanceForEvent = (eventId: string): EventAttendanceFormData => {
    return (
      eventAttendance.find((ea) => ea.event_id === eventId) || {
        event_id: eventId,
        attending: false,
        shuttle_to_event: null,
        shuttle_from_event: null,
        notes: null,
      }
    );
  };

  const updateAttendance = (
    eventId: string,
    field: keyof EventAttendanceFormData,
    value: boolean | string | null
  ) => {
    const updatedAttendance: EventAttendanceFormData[] = eventAttendance.map((ea) => {
      if (ea.event_id === eventId) {
        // If unchecking attending, also clear shuttle fields
        if (field === 'attending' && !value) {
          return { ...ea, attending: false, shuttle_to_event: null, shuttle_from_event: null };
        }
        // Handle each field type appropriately
        if (field === 'attending') {
          return { ...ea, attending: value as boolean };
        }
        if (field === 'shuttle_to_event' || field === 'shuttle_from_event' || field === 'notes') {
          return { ...ea, [field]: value as string | null };
        }
        return ea;
      }
      return ea;
    });

    // If event not found in array, add it
    if (!eventAttendance.find((ea) => ea.event_id === eventId)) {
      updatedAttendance.push({
        event_id: eventId,
        attending: field === 'attending' ? (value as boolean) : false,
        shuttle_to_event: field === 'shuttle_to_event' ? (value as string | null) : null,
        shuttle_from_event: field === 'shuttle_from_event' ? (value as string | null) : null,
        notes: field === 'notes' ? (value as string | null) : null,
      });
    }

    setValue('event_attendance', updatedAttendance);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading events...</span>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events have been created for this wedding yet.
        <br />
        <span className="text-sm">
          Add events in the Events section to enable attendance tracking.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isDeclined && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This guest has declined the invitation. Event attendance selections are disabled.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Select which events this guest will attend and provide shuttle
        information if needed.
      </div>

      {events.map((event: EventWithDetails) => {
        const attendance = getAttendanceForEvent(event.id);
        const isAttending = attendance.attending;

        return (
          <div
            key={event.id}
            className={`border rounded-lg p-4 space-y-3 ${isDeclined ? 'opacity-50' : ''}`}
          >
            {/* Event Name & Attendance Checkbox */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id={`attending-${event.id}`}
                checked={isAttending}
                disabled={isDeclined}
                onCheckedChange={(checked) =>
                  updateAttendance(event.id, 'attending', checked === true)
                }
              />
              <Label
                htmlFor={`attending-${event.id}`}
                className={`font-medium ${isDeclined ? '' : 'cursor-pointer'}`}
              >
                {event.event_name}
              </Label>
            </div>

            {/* Shuttle Fields - Only shown when attending */}
            {isAttending && (
              <div className="ml-7 space-y-3 pt-2 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shuttle To Event */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`shuttle-to-${event.id}`}
                      className="text-sm"
                    >
                      Shuttle to event
                    </Label>
                    <Input
                      id={`shuttle-to-${event.id}`}
                      value={attendance.shuttle_to_event || ''}
                      onChange={(e) =>
                        updateAttendance(
                          event.id,
                          'shuttle_to_event',
                          e.target.value || null
                        )
                      }
                      placeholder="e.g., Bus A, Car 1, White Van"
                      className="h-9"
                      disabled={isDeclined}
                    />
                  </div>

                  {/* Shuttle From Event */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`shuttle-from-${event.id}`}
                      className="text-sm"
                    >
                      Shuttle from event
                    </Label>
                    <Input
                      id={`shuttle-from-${event.id}`}
                      value={attendance.shuttle_from_event || ''}
                      onChange={(e) =>
                        updateAttendance(
                          event.id,
                          'shuttle_from_event',
                          e.target.value || null
                        )
                      }
                      placeholder="e.g., Bus A, Car 1, White Van"
                      className="h-9"
                      disabled={isDeclined}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
