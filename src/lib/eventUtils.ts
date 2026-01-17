// src/lib/eventUtils.ts

import type { Event } from '@/types/event';

/**
 * Check if two events have overlapping time ranges
 * Uses standard interval overlap formula: start1 < end2 AND start2 < end1
 */
export function eventsOverlap(event1: Event, event2: Event): boolean {
  if (event1.event_date !== event2.event_date) return false;

  const start1 = new Date(`2000-01-01T${event1.event_start_time}`);
  const end1 = new Date(`2000-01-01T${event1.event_end_time}`);
  const start2 = new Date(`2000-01-01T${event2.event_start_time}`);
  const end2 = new Date(`2000-01-01T${event2.event_end_time}`);

  return start1 < end2 && start2 < end1;
}

/**
 * Find all events that overlap with a given event
 */
export function findOverlappingEvents(
  currentEvent: Partial<Event>,
  allEvents: Event[]
): Event[] {
  if (!currentEvent.event_date || !currentEvent.event_start_time || !currentEvent.event_end_time) {
    return [];
  }

  return allEvents.filter(event => {
    if (event.id === currentEvent.id) return false;
    return eventsOverlap(currentEvent as Event, event);
  });
}

/**
 * Format a user-friendly overlap warning message
 */
export function formatOverlapMessage(overlappingEvents: Event[]): string {
  if (overlappingEvents.length === 0) return '';

  if (overlappingEvents.length === 1) {
    return `Overlaps with ${overlappingEvents[0].event_name}`;
  }

  const names = overlappingEvents.slice(0, 2).map(e => e.event_name);
  const remaining = overlappingEvents.length - 2;

  if (remaining > 0) {
    return `Overlaps with ${names.join(', ')} + ${remaining} more`;
  }

  return `Overlaps with ${names.join(', ')}`;
}
