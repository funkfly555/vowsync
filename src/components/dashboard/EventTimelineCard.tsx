/**
 * EventTimelineCard - Horizontal scrolling timeline of event cards
 * Uses event-specific colors from getEventColor(event_order)
 * @feature 022-dashboard-visual-metrics
 * @task T005, T039-T046
 */

import { Calendar, Users, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getEventColor, cn } from '@/lib/utils';

interface EventData {
  id: string;
  event_name: string;
  event_date: string;
  event_start_time?: string | null;
  event_order: number;
  expected_guests?: number | null;
}

interface EventTimelineCardProps {
  events: EventData[];
  weddingId?: string;
  isLoading?: boolean;
}

/**
 * EventCard - Individual event card with color based on event_order (T039, T040)
 */
function EventCard({ event }: { event: EventData }) {
  const backgroundColor = getEventColor(event.event_order);

  // Format date (T043)
  const formattedDate = format(new Date(event.event_date), 'MMM d, yyyy');

  // Format time if exists (T043)
  const formattedTime = event.event_start_time
    ? event.event_start_time.substring(0, 5) // HH:MM format
    : null;

  return (
    <div
      className={cn(
        // T010-T011: Reduced widths to prevent horizontal page scroll (023-dashboard-bug-fixes)
        'min-w-[200px] max-w-[260px] rounded-lg p-4',
        // Scroll snap alignment (T041)
        'snap-start',
        // Flex-shrink to prevent compression
        'flex-shrink-0'
      )}
      style={{ backgroundColor }}
    >
      {/* Event name with ellipsis truncation (T045) */}
      <h4 className="font-semibold text-gray-900 text-lg truncate mb-3">
        {event.event_name}
      </h4>

      <div className="space-y-2">
        {/* Date */}
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{formattedDate}</span>
        </div>

        {/* Time (if exists) */}
        {formattedTime && (
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{formattedTime}</span>
          </div>
        )}

        {/* Expected guests (if exists) */}
        {event.expected_guests != null && (
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{event.expected_guests} expected guests</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton (T046)
 */
function EventTimelineSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6">
      <div className="h-5 w-28 bg-gray-200 rounded mb-4 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="min-w-[280px] h-[140px] bg-gray-200 rounded-lg animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Empty state (T044)
 */
function EmptyState({ weddingId }: { weddingId?: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Event Timeline</h3>
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm text-center mb-4">No events scheduled</p>
        {weddingId && (
          <Link
            to={`/wedding/${weddingId}/events`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#C49494] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * EventTimelineCard - Horizontal scrolling container (T041, T042)
 */
export function EventTimelineCard({
  events,
  weddingId,
  isLoading = false,
}: EventTimelineCardProps) {
  if (isLoading) {
    return <EventTimelineSkeleton />;
  }

  if (events.length === 0) {
    return <EmptyState weddingId={weddingId} />;
  }

  // Sort events by event_order
  const sortedEvents = [...events].sort((a, b) => a.event_order - b.event_order);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Event Timeline</h3>

      {/* Horizontal scroll container (T041) */}
      <div
        className={cn(
          // T012: Reduced gap for better fit on desktop viewports (023-dashboard-bug-fixes)
          'flex gap-3',
          // Horizontal scroll with snap
          'overflow-x-auto',
          'scroll-snap-type-x mandatory',
          // Hide scrollbar on webkit
          'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
          // Touch-friendly padding for mobile (T065)
          'pb-2 -mb-2'
        )}
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {sortedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
