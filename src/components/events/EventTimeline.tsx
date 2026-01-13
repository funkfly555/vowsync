import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EventCard } from './EventCard';
import { EmptyEventsState } from './EmptyEventsState';
import { DeleteEventDialog } from './DeleteEventDialog';
import { getEventColor } from '@/lib/utils';
import { useDeleteEvent } from '@/hooks/useEvents';
import type { Event } from '@/types/event';

interface EventTimelineProps {
  events: Event[];
  weddingId: string;
}

export function EventTimeline({ events, weddingId }: EventTimelineProps) {
  const navigate = useNavigate();
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const deleteEvent = useDeleteEvent();

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent.mutateAsync({
        eventId: eventToDelete.id,
        weddingId,
      });
      toast.success('Event deleted successfully');
      setEventToDelete(null);
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  if (events.length === 0) {
    return <EmptyEventsState weddingId={weddingId} />;
  }

  return (
    <>
      <div className="relative" role="list" aria-label="Event timeline">
        {/* Vertical timeline line - hidden on mobile for cleaner look */}
        <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gray-200 hidden sm:block" aria-hidden="true" />

        {/* Event cards */}
        <div className="space-y-3 sm:space-y-4">
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-2 sm:gap-4" role="listitem">
              {/* Timeline circle indicator - smaller on mobile */}
              <div
                className="relative z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-3 sm:mt-4"
                style={{ backgroundColor: getEventColor(event.event_order) }}
                aria-hidden="true"
              >
                <span className="text-white text-xs sm:text-sm font-medium">
                  {event.event_order}
                </span>
              </div>

              {/* Event card */}
              <div className="flex-1 min-w-0">
                <EventCard
                  event={event}
                  onClick={() =>
                    navigate(`/weddings/${weddingId}/events/${event.id}/edit`)
                  }
                  onDeleteClick={() => setEventToDelete(event)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteEventDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        onConfirm={handleDelete}
        eventName={eventToDelete?.event_name ?? ''}
        isDeleting={deleteEvent.isPending}
      />
    </>
  );
}
