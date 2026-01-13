import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EventForm } from '@/components/events/EventForm';
import { DeleteEventDialog } from '@/components/events/DeleteEventDialog';
import {
  useEvent,
  useUpdateEvent,
  useDeleteEvent,
  useUsedEventOrders,
  useEventHasGuests,
} from '@/hooks/useEvents';
import type { EventFormValues } from '@/schemas/event';

export function EditEventPage() {
  const { weddingId, eventId } = useParams<{ weddingId: string; eventId: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: event, isLoading: eventLoading } = useEvent(eventId!);
  const { data: usedOrders, isLoading: ordersLoading } = useUsedEventOrders(weddingId!);
  const { data: hasGuests } = useEventHasGuests(eventId!);
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const isLoading = eventLoading || ordersLoading;

  const handleSubmit = async (data: EventFormValues) => {
    try {
      await updateEvent.mutateAsync({
        eventId: eventId!,
        weddingId: weddingId!,
        data,
      });
      toast.success('Event updated successfully');
      navigate(`/weddings/${weddingId}/events`);
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handleCancel = () => {
    navigate(`/weddings/${weddingId}/events`);
  };

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync({
        eventId: eventId!,
        weddingId: weddingId!,
      });
      toast.success('Event deleted successfully');
      navigate(`/weddings/${weddingId}/events`);
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event not found</h2>
          <Button asChild variant="outline">
            <Link to={`/weddings/${weddingId}/events`}>Back to Timeline</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
            <Link to={`/weddings/${weddingId}/events`} aria-label="Back to timeline">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">Edit Event</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {event.wedding.bride_name} & {event.wedding.groom_name}
            </p>
          </div>
        </div>

        {/* Guest attendance warning */}
        {hasGuests && (
          <Alert className="mb-4 sm:mb-6">
            <AlertDescription>
              This event has guests assigned. Changing the event order may affect guest assignments.
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <EventForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={updateEvent.isPending}
              defaultValues={{
                event_order: event.event_order,
                event_name: event.event_name,
                event_type: event.event_type ?? 'other',
                event_date: new Date(event.event_date + 'T00:00:00'),
                event_start_time: event.event_start_time.slice(0, 5), // Strip seconds (HH:mm:ss -> HH:mm)
                event_end_time: event.event_end_time.slice(0, 5), // Strip seconds (HH:mm:ss -> HH:mm)
                event_location: event.event_location,
                notes: event.notes ?? '',
              }}
              usedOrders={usedOrders ?? []}
              weddingDate={event.wedding.wedding_date}
              currentEventId={eventId}
            />
          </CardContent>
        </Card>

        {/* Delete button */}
        <div className="mt-4 sm:mt-6 flex justify-start">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteEvent.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Event
          </Button>
        </div>

        {/* Delete dialog */}
        <DeleteEventDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          eventName={event.event_name}
          isDeleting={deleteEvent.isPending}
        />
      </div>
    </div>
  );
}
