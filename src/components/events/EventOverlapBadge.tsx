import { AlertTriangle } from 'lucide-react';
import type { Event } from '@/types/event';
import { formatOverlapMessage } from '@/lib/eventUtils';

interface EventOverlapBadgeProps {
  /**
   * Array of events that overlap with the current event being edited
   * Used to generate warning message
   */
  overlappingEvents: Event[];
}

/**
 * Displays a warning badge when events have overlapping time ranges
 *
 * @component
 * @example
 * <EventOverlapBadge overlappingEvents={[event1, event2]} />
 *
 * Visual output:
 * - 1 event:  "⚠️ Overlaps with Ceremony"
 * - 2 events: "⚠️ Overlaps with Ceremony, Reception"
 * - 3+ events: "⚠️ Overlaps with Ceremony, Reception + 1 more"
 */
export function EventOverlapBadge({ overlappingEvents }: EventOverlapBadgeProps) {
  if (overlappingEvents.length === 0) return null;

  const message = formatOverlapMessage(overlappingEvents);

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium bg-[#FF9800] text-white">
      <AlertTriangle className="h-3 w-3 mr-1" />
      {message}
    </span>
  );
}
