import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventForm } from '@/components/events/EventForm';
import { useCreateEvent, useUsedEventOrders, getNextAvailableOrder } from '@/hooks/useEvents';
import { useWedding } from '@/hooks/useWeddings';
import type { EventFormValues } from '@/schemas/event';

export function CreateEventPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const { data: wedding, isLoading: weddingLoading } = useWedding(weddingId!);
  const { data: usedOrders, isLoading: ordersLoading } = useUsedEventOrders(weddingId!);
  const createEvent = useCreateEvent();

  const isLoading = weddingLoading || ordersLoading;

  const handleSubmit = async (data: EventFormValues) => {
    try {
      await createEvent.mutateAsync({
        weddingId: weddingId!,
        data,
      });
      toast.success('Event created successfully');
      navigate(`/weddings/${weddingId}/events`);
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handleCancel = () => {
    navigate(`/weddings/${weddingId}/events`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Wedding not found</h2>
          <Button asChild variant="outline">
            <Link to="/">Back to Weddings</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check max events
  if ((usedOrders?.length ?? 0) >= 10) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Maximum Events Reached</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This wedding already has the maximum of 10 events.
              </p>
              <Button asChild variant="outline">
                <Link to={`/weddings/${weddingId}/events`}>Back to Timeline</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const nextOrder = getNextAvailableOrder(usedOrders ?? []);

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
            <h1 className="text-xl sm:text-2xl font-bold">Create Event</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {wedding.bride_name} & {wedding.groom_name}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <EventForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={createEvent.isPending}
              defaultValues={{
                event_order: nextOrder,
                event_date: new Date(wedding.wedding_date + 'T00:00:00'),
              }}
              usedOrders={usedOrders ?? []}
              weddingDate={wedding.wedding_date}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
