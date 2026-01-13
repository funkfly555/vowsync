import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventTimeline } from '@/components/events/EventTimeline';
import { useEvents } from '@/hooks/useEvents';
import { useWedding } from '@/hooks/useWeddings';

export function EventTimelinePage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const { data: wedding, isLoading: weddingLoading } = useWedding(weddingId!);
  const { data: events, isLoading: eventsLoading } = useEvents(weddingId!);

  const isLoading = weddingLoading || eventsLoading;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-2 mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
              <Link to="/" aria-label="Back to weddings">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                {wedding.bride_name} & {wedding.groom_name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">Events Timeline</p>
            </div>
          </div>
          <Button asChild size="sm" className="flex-shrink-0 sm:size-default">
            <Link to={`/weddings/${weddingId}/events/new`}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Event</span>
            </Link>
          </Button>
        </div>

        {/* Timeline */}
        <EventTimeline events={events ?? []} weddingId={weddingId!} />
      </div>
    </div>
  );
}
