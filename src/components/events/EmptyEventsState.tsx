import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyEventsStateProps {
  weddingId: string;
}

export function EmptyEventsState({ weddingId }: EmptyEventsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No events yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Create your first event to start building the wedding day schedule.
      </p>
      <Button asChild>
        <Link to={`/weddings/${weddingId}/events/new`}>Add First Event</Link>
      </Button>
    </div>
  );
}
