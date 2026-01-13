import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { formatDate, cn } from '@/lib/utils';
import { Calendar, MapPin, Users, Trash2, CalendarDays } from 'lucide-react';
import type { Wedding } from '@/types/wedding';

interface WeddingCardProps {
  wedding: Wedding;
  onDeleteClick: (wedding: Wedding) => void;
}

export function WeddingCard({ wedding, onDeleteClick }: WeddingCardProps) {
  const navigate = useNavigate();
  const totalGuests = wedding.guest_count_adults + wedding.guest_count_children;

  const handleCardClick = () => {
    navigate(`/weddings/${wedding.id}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(wedding);
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
      onClick={handleCardClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      aria-label={`Edit wedding for ${wedding.bride_name} and ${wedding.groom_name}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-display text-lg font-semibold text-foreground truncate"
            title={`${wedding.bride_name} & ${wedding.groom_name}`}
          >
            {wedding.bride_name} & {wedding.groom_name}
          </h3>
          <StatusBadge status={wedding.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{formatDate(wedding.wedding_date)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate" title={wedding.venue_name}>
            {wedding.venue_name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          <span>{totalGuests} guests</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/weddings/${wedding.id}/events`);
            }}
            aria-label={`View events for ${wedding.bride_name} and ${wedding.groom_name}`}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Events
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDeleteClick}
            aria-label={`Delete wedding for ${wedding.bride_name} and ${wedding.groom_name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
