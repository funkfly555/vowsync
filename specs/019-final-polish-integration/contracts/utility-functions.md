# Utility Functions Contract: Final Polish Integration

**Feature**: 019-final-polish-integration
**Date**: 2026-01-17

---

## File: `src/lib/eventUtils.ts`

New utility file for event overlap detection functions.

---

## Function: `eventsOverlap`

### Signature

```typescript
/**
 * Check if two events have overlapping time ranges
 *
 * Uses standard interval overlap formula: start1 < end2 AND start2 < end1
 *
 * @param event1 - First event to compare
 * @param event2 - Second event to compare
 * @returns true if events overlap, false otherwise
 *
 * @example
 * // Events on different dates - no overlap
 * eventsOverlap(
 *   { event_date: '2026-06-15', event_start_time: '14:00', event_end_time: '15:00' },
 *   { event_date: '2026-06-16', event_start_time: '14:00', event_end_time: '15:00' }
 * ); // false
 *
 * @example
 * // Events on same date with overlapping times
 * eventsOverlap(
 *   { event_date: '2026-06-15', event_start_time: '14:00', event_end_time: '16:00' },
 *   { event_date: '2026-06-15', event_start_time: '15:00', event_end_time: '17:00' }
 * ); // true
 */
export function eventsOverlap(event1: Event, event2: Event): boolean;
```

### Implementation

```typescript
export function eventsOverlap(event1: Event, event2: Event): boolean {
  // Different dates never overlap
  if (event1.event_date !== event2.event_date) return false;

  // Parse times using fixed date for comparison
  const start1 = new Date(`2000-01-01T${event1.event_start_time}`);
  const end1 = new Date(`2000-01-01T${event1.event_end_time}`);
  const start2 = new Date(`2000-01-01T${event2.event_start_time}`);
  const end2 = new Date(`2000-01-01T${event2.event_end_time}`);

  // Standard interval overlap: start1 < end2 AND start2 < end1
  return start1 < end2 && start2 < end1;
}
```

### Test Cases

| Event 1 | Event 2 | Expected | Reason |
|---------|---------|----------|--------|
| 14:00-16:00 (Jun 15) | 15:00-17:00 (Jun 15) | `true` | Times overlap on same date |
| 14:00-15:00 (Jun 15) | 15:00-16:00 (Jun 15) | `false` | Back-to-back (no overlap) |
| 14:00-16:00 (Jun 15) | 14:00-16:00 (Jun 16) | `false` | Different dates |
| 10:00-12:00 (Jun 15) | 11:00-11:30 (Jun 15) | `true` | One inside other |
| 14:00-18:00 (Jun 15) | 12:00-15:00 (Jun 15) | `true` | Partial overlap |

---

## Function: `findOverlappingEvents`

### Signature

```typescript
/**
 * Find all events that overlap with a given event
 *
 * @param currentEvent - The event to check for overlaps
 * @param allEvents - All events to check against
 * @returns Array of events that overlap with currentEvent
 *
 * @example
 * const overlaps = findOverlappingEvents(newEvent, existingEvents);
 * if (overlaps.length > 0) {
 *   console.log('Warning: overlaps with', overlaps.map(e => e.event_name));
 * }
 */
export function findOverlappingEvents(
  currentEvent: Event,
  allEvents: Event[]
): Event[];
```

### Implementation

```typescript
export function findOverlappingEvents(
  currentEvent: Event,
  allEvents: Event[]
): Event[] {
  // Validate inputs
  if (!currentEvent.event_date || !currentEvent.event_start_time || !currentEvent.event_end_time) {
    return [];
  }

  return allEvents
    .filter(event => {
      // Don't compare event with itself (for edit mode)
      if (event.id === currentEvent.id) return false;

      // Check if events overlap
      return eventsOverlap(currentEvent, event);
    });
}
```

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty allEvents array | Returns `[]` |
| currentEvent missing fields | Returns `[]` |
| currentEvent.id matches an event | Excludes that event |
| No overlaps found | Returns `[]` |

---

## Function: `formatOverlapMessage`

### Signature

```typescript
/**
 * Format a user-friendly overlap warning message
 *
 * @param overlappingEvents - Array of events that overlap
 * @returns Formatted message string
 *
 * @example
 * formatOverlapMessage([ceremony]); // "Overlaps with Ceremony"
 * formatOverlapMessage([ceremony, reception]); // "Overlaps with Ceremony, Reception"
 * formatOverlapMessage([e1, e2, e3]); // "Overlaps with Event 1, Event 2 + 1 more"
 */
export function formatOverlapMessage(overlappingEvents: Event[]): string;
```

### Implementation

```typescript
export function formatOverlapMessage(overlappingEvents: Event[]): string {
  if (overlappingEvents.length === 0) return '';

  if (overlappingEvents.length === 1) {
    return `Overlaps with ${overlappingEvents[0].event_name}`;
  }

  // Show first two names, then "+ X more"
  const names = overlappingEvents.slice(0, 2).map(e => e.event_name);
  const remaining = overlappingEvents.length - 2;

  if (remaining > 0) {
    return `Overlaps with ${names.join(', ')} + ${remaining} more`;
  }

  return `Overlaps with ${names.join(', ')}`;
}
```

### Output Examples

| Input Count | Example Names | Output |
|-------------|---------------|--------|
| 0 | - | `""` |
| 1 | Ceremony | `"Overlaps with Ceremony"` |
| 2 | Ceremony, Reception | `"Overlaps with Ceremony, Reception"` |
| 3 | A, B, C | `"Overlaps with A, B + 1 more"` |
| 5 | A, B, C, D, E | `"Overlaps with A, B + 3 more"` |

---

## Complete File

```typescript
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
  currentEvent: Event,
  allEvents: Event[]
): Event[] {
  if (!currentEvent.event_date || !currentEvent.event_start_time || !currentEvent.event_end_time) {
    return [];
  }

  return allEvents.filter(event => {
    if (event.id === currentEvent.id) return false;
    return eventsOverlap(currentEvent, event);
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
```
