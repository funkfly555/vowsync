/**
 * GuestEventsShuttlesTab - Merged Events & Shuttles Tab
 * @feature 007-guest-crud-attendance
 *
 * Combined tab with expandable event cards showing shuttle journey timeline
 * Uses Vowsync design system colors (dusty rose, gold, sage green)
 */

import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Loader2,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  MapPin,
  Bus,
  Hotel
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { GuestFormData, EventAttendanceFormData } from '@/types/guest';
import { useWeddingEventsForAttendance } from '@/hooks/useGuests';

interface GuestEventsShuttlesTabProps {
  form: UseFormReturn<GuestFormData>;
  weddingId: string;
}

interface EventWithShuttle {
  id: string;
  event_name: string;
  event_order: number;
  event_date: string | null;
  event_start_time: string | null;
  event_end_time: string | null;
  event_location: string | null;
  shuttle_from_location: string | null;
  shuttle_departure_to_event: string | null;
  shuttle_departure_from_event: string | null;
}

// Helper functions
function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return 'TBD';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function GuestEventsShuttlesTab({ form, weddingId }: GuestEventsShuttlesTabProps) {
  const { setValue, watch } = form;
  const eventAttendance = watch('event_attendance');
  const invitationStatus = watch('invitation_status');

  const isDeclined = invitationStatus === 'declined';

  const { data: events, isLoading } = useWeddingEventsForAttendance(weddingId);

  // Initialize event_attendance array when events load
  useEffect(() => {
    if (events && events.length > 0 && eventAttendance.length === 0) {
      const initialAttendance: EventAttendanceFormData[] = events.map(
        (event: EventWithShuttle) => ({
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

  const toggleShuttle = (eventId: string, useShuttle: boolean) => {
    const updatedAttendance: EventAttendanceFormData[] = eventAttendance.map((ea) => {
      if (ea.event_id === eventId) {
        return {
          ...ea,
          shuttle_to_event: useShuttle ? 'Yes' : null,
          shuttle_from_event: useShuttle ? 'Yes' : null,
        };
      }
      return ea;
    });
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
        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="font-medium">No events created yet</p>
        <p className="text-sm mt-2">
          Add events in the Events & Shuttles section to enable attendance tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Declined Warning */}
      {isDeclined && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This guest has declined the invitation. Event attendance selections are disabled.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Banner */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Event & Shuttle Selection</AlertTitle>
        <AlertDescription className="text-blue-800">
          Select which events this guest will attend. If shuttle service is configured for an event,
          toggle the switch to assign this guest to use the shuttle.
        </AlertDescription>
      </Alert>

      {/* Event Cards List */}
      <div className="space-y-3">
        {events.map((event: EventWithShuttle) => {
          const attendance = getAttendanceForEvent(event.id);
          const isAttending = attendance.attending;
          const isUsingShuttle = !!(attendance.shuttle_to_event || attendance.shuttle_from_event);
          const hasShuttleConfigured = !!(event.shuttle_from_location || event.shuttle_departure_to_event || event.shuttle_departure_from_event);

          return (
            <div
              key={event.id}
              className={cn(
                "border rounded-lg p-4 space-y-3",
                isDeclined && "opacity-50"
              )}
            >
              {/* Event Name & Attendance Checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`attending-${event.id}`}
                  checked={isAttending}
                  disabled={isDeclined}
                  onCheckedChange={(checked) =>
                    updateAttendance(event.id, 'attending', checked === true)
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`attending-${event.id}`}
                    className={cn("font-medium cursor-pointer", isDeclined && "cursor-not-allowed")}
                  >
                    {event.event_name}
                  </Label>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.event_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.event_start_time)} - {formatTime(event.event_end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.event_location || 'Location TBD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shuttle Section - Only shown when attending */}
              {isAttending && (
                <div className="ml-7 pt-3 border-t space-y-3">
                  {/* Shuttle Header with Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Bus className="h-4 w-4 text-[#D4A5A5]" />
                      Shuttle Service
                    </div>

                    {hasShuttleConfigured && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {isUsingShuttle ? 'Assigned' : 'Not assigned'}
                        </span>
                        <Switch
                          checked={isUsingShuttle}
                          onCheckedChange={(checked) => toggleShuttle(event.id, checked)}
                          disabled={isDeclined}
                          className="data-[state=checked]:bg-[#A8B8A6]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Shuttle Details */}
                  {hasShuttleConfigured && isUsingShuttle ? (
                    <div className="space-y-3">
                      {/* Pickup */}
                      <div className="bg-muted/30 border rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-[#D4A5A5]">
                          <Hotel className="h-3.5 w-3.5" />
                          1. Pickup
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Location: </span>
                            <span className="font-medium">{event.shuttle_from_location || 'TBD'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Departs: </span>
                            <span className="font-medium">{formatTime(event.shuttle_departure_to_event)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Event */}
                      <div className="bg-[#FFFBF0] border border-[#C9A961]/20 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-[#C9A961]">
                          <MapPin className="h-3.5 w-3.5" />
                          2. Event
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Venue: </span>
                            <span className="font-medium">{event.event_location || 'TBD'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Starts: </span>
                            <span className="font-medium">{formatTime(event.event_start_time)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Return */}
                      <div className="bg-muted/30 border rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-[#A8B8A6]">
                          <Hotel className="h-3.5 w-3.5" />
                          3. Return
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Destination: </span>
                            <span className="font-medium">{event.shuttle_from_location || 'TBD'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Departs: </span>
                            <span className="font-medium">{formatTime(event.shuttle_departure_from_event)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 text-sm">
                        {hasShuttleConfigured
                          ? 'Toggle the switch to assign this guest to the shuttle service.'
                          : 'No shuttle configured for this event. Set up shuttle details on the Events & Shuttles page.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
