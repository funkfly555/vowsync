/**
 * GuestShuttleTab - Tab 7: Shuttle Assignments
 * @feature 024-guest-menu-management
 *
 * Focused view of shuttle assignments for events the guest is attending.
 * Shuttle data is stored in event_attendance (shuttle_to_event, shuttle_from_event).
 */

import { UseFormReturn } from 'react-hook-form';
import { Loader2, Bus, ArrowRight, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GuestFormData, EventAttendanceFormData } from '@/types/guest';
import { useWeddingEventsForAttendance } from '@/hooks/useGuests';

interface GuestShuttleTabProps {
  form: UseFormReturn<GuestFormData>;
  weddingId: string;
}

interface EventWithDetails {
  id: string;
  event_name: string;
  event_order: number;
  event_date: string | null;
}

export function GuestShuttleTab({ form, weddingId }: GuestShuttleTabProps) {
  const { setValue, watch } = form;
  const eventAttendance = watch('event_attendance');
  const hasPlusOne = watch('has_plus_one');
  const plusOneName = watch('plus_one_name');
  const invitationStatus = watch('invitation_status');

  const { data: events, isLoading } = useWeddingEventsForAttendance(weddingId);

  const isDeclined = invitationStatus === 'declined';

  // Get events where guest is attending
  const attendingEvents = events?.filter((event: EventWithDetails) =>
    eventAttendance?.find((ea) => ea.event_id === event.id && ea.attending)
  );

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

  const updateShuttle = (
    eventId: string,
    field: 'shuttle_to_event' | 'shuttle_from_event',
    value: string | null
  ) => {
    const updatedAttendance: EventAttendanceFormData[] = eventAttendance.map((ea) => {
      if (ea.event_id === eventId) {
        return { ...ea, [field]: value };
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

  if (!attendingEvents || attendingEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="font-medium">No events selected</p>
        <p className="text-sm mt-2">
          Mark events as attending in the Events tab to configure shuttle assignments.
        </p>
      </div>
    );
  }

  // Count total shuttle assignments
  const shuttleCount = eventAttendance.reduce((count, ea) => {
    if (ea.shuttle_to_event) count++;
    if (ea.shuttle_from_event) count++;
    return count;
  }, 0);

  return (
    <div className="space-y-6">
      {isDeclined && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This guest has declined the invitation. Shuttle assignments are disabled.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Assign shuttles for transporting the guest to and from events.
        {shuttleCount > 0 && (
          <span className="ml-2 text-green-600 font-medium">
            ({shuttleCount} assignment{shuttleCount !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {attendingEvents.map((event: EventWithDetails) => {
        const attendance = getAttendanceForEvent(event.id);

        return (
          <div key={event.id} className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              <Bus className="h-4 w-4 text-[#5C4B4B]" />
              {event.event_name}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Shuttle To Event */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-green-600" />
                  Shuttle To Event
                </Label>
                <Input
                  value={attendance.shuttle_to_event || ''}
                  onChange={(e) =>
                    updateShuttle(event.id, 'shuttle_to_event', e.target.value || null)
                  }
                  placeholder="e.g., Bus A, Van 1, Hotel Shuttle"
                  disabled={isDeclined}
                  className={isDeclined ? 'opacity-50' : ''}
                />
              </div>

              {/* Shuttle From Event */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3 text-blue-600" />
                  Shuttle From Event
                </Label>
                <Input
                  value={attendance.shuttle_from_event || ''}
                  onChange={(e) =>
                    updateShuttle(event.id, 'shuttle_from_event', e.target.value || null)
                  }
                  placeholder="e.g., Bus A, Van 1, Own Transport"
                  disabled={isDeclined}
                  className={isDeclined ? 'opacity-50' : ''}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Plus One Note */}
      {hasPlusOne && (
        <div className="p-4 bg-gray-50 border rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <UserPlus className="h-4 w-4" />
            Plus One: {plusOneName || 'Guest'}
          </div>
          <p className="text-sm text-gray-500">
            Plus ones travel with the primary guest. The shuttle assignments above apply to both.
          </p>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <p className="font-medium">Tip</p>
        <p className="mt-1">
          You can also edit shuttle assignments in the Events tab. Changes sync between both views.
        </p>
      </div>
    </div>
  );
}
