import { MapPin, Users, Trash2, Bus, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DurationDisplay } from './DurationDisplay';
import { formatTime, formatDate, getEventColor, getEventGuestCount } from '@/lib/utils';
import type { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  onDeleteClick?: () => void;
}

export function EventCard({ event, onClick, onDeleteClick }: EventCardProps) {
  const eventColor = getEventColor(event.event_order);
  const guestCount = getEventGuestCount(event);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick?.();
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      style={{ borderLeftWidth: '4px', borderLeftColor: eventColor }}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${event.event_name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            {/* Event order badge and name */}
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <span
                className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-medium text-white flex-shrink-0"
                style={{ backgroundColor: eventColor }}
                aria-hidden="true"
              >
                {event.event_order}
              </span>
              <h3 className="font-semibold text-base sm:text-lg truncate">{event.event_name}</h3>
            </div>

            {/* Date and time */}
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              <span className="hidden sm:inline">{formatDate(event.event_date, 'EEE, MMM d, yyyy')}</span>
              <span className="sm:hidden">{formatDate(event.event_date, 'MMM d')}</span>
              {' '}&bull;{' '}
              {formatTime(event.event_start_time)} - {formatTime(event.event_end_time)}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{event.event_location}</span>
            </div>

            {/* Duration and guests */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <DurationDisplay hours={event.duration_hours} />
                {guestCount > 0 && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{guestCount} guests</span>
                    <span className="sm:hidden">{guestCount}</span>
                  </div>
                )}
              </div>
              {onDeleteClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                  onClick={handleDeleteClick}
                  aria-label={`Delete ${event.event_name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Shuttle Section - Only show if shuttle data exists */}
            {(event.shuttle_from_location || event.shuttle_departure_to_event || event.shuttle_departure_from_event) && (
              <>
                {/* Separator */}
                <div className="mt-3 sm:mt-4 border-t border-dashed border-border" />

                {/* Shuttle Journey */}
                <div className="mt-3 sm:mt-4">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Bus className="h-4 w-4" style={{ color: '#D4A5A5' }} />
                    <span className="text-xs sm:text-sm font-semibold" style={{ color: '#D4A5A5' }}>
                      Shuttle Service
                    </span>
                  </div>

                  {/* Journey Timeline */}
                  <div
                    className="rounded-lg p-2 sm:p-3 border"
                    style={{
                      backgroundColor: '#FAFAFA',
                      borderColor: '#E8E8E8',
                      borderLeftWidth: '3px',
                      borderLeftColor: '#D4A5A5',
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2">
                      {/* PICKUP POINT */}
                      <div className="flex-1 flex sm:flex-col items-center sm:items-center gap-2 sm:gap-0 sm:text-center">
                        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-1 w-12 sm:w-auto">
                          Pickup
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-foreground">
                          {event.shuttle_departure_to_event ? formatTime(event.shuttle_departure_to_event) : '—'}
                        </div>
                        {event.shuttle_from_location && (
                          <div className="text-[10px] sm:text-xs text-muted-foreground sm:mt-1 truncate max-w-[100px] sm:max-w-none">
                            {event.shuttle_from_location}
                          </div>
                        )}
                      </div>

                      {/* ARROW */}
                      <ArrowRight
                        className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 self-center rotate-90 sm:rotate-0 hidden sm:block"
                        style={{ color: '#D4A5A5' }}
                      />

                      {/* EVENT POINT */}
                      <div className="flex-1 flex sm:flex-col items-center sm:items-center gap-2 sm:gap-0 sm:text-center">
                        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-1 w-12 sm:w-auto">
                          Event
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-foreground">
                          {formatTime(event.event_start_time)}
                        </div>
                        {event.event_location && (
                          <div className="text-[10px] sm:text-xs text-muted-foreground sm:mt-1 truncate max-w-[100px] sm:max-w-none">
                            {event.event_location}
                          </div>
                        )}
                      </div>

                      {/* ARROW */}
                      <ArrowRight
                        className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 self-center rotate-90 sm:rotate-0 hidden sm:block"
                        style={{ color: '#D4A5A5' }}
                      />

                      {/* RETURN POINT */}
                      <div className="flex-1 flex sm:flex-col items-center sm:items-center gap-2 sm:gap-0 sm:text-center">
                        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-1 w-12 sm:w-auto">
                          Return
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-foreground">
                          {event.shuttle_departure_from_event ? formatTime(event.shuttle_departure_from_event) : '—'}
                        </div>
                        {event.shuttle_from_location && (
                          <div className="text-[10px] sm:text-xs text-muted-foreground sm:mt-1 truncate max-w-[100px] sm:max-w-none">
                            {event.shuttle_from_location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
