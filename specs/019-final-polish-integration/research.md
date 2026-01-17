# Research: Final Polish Integration

**Feature**: 019-final-polish-integration
**Date**: 2026-01-17

## Research Summary

This feature has minimal unknowns due to comprehensive user-provided specifications. All technical decisions are predetermined by the existing codebase patterns and constitution.

---

## Decision 1: Event Overlap Detection Algorithm

**Decision**: Use standard interval overlap formula: `start1 < end2 AND start2 < end1`

**Rationale**:
- User explicitly specified this algorithm in the feature request
- Industry-standard approach for time interval intersection
- Simple, efficient O(1) comparison per event pair
- No edge cases with boundary conditions (exclusive end times)

**Alternatives Considered**:
1. ~~Inclusive boundary check (`start1 <= end2`)~~ - Could cause false positives when events are back-to-back
2. ~~Complex interval tree structure~~ - Overkill for typical wedding event count (< 10 events)

**Implementation**:
```typescript
// Events overlap if they are on the same date AND their time ranges intersect
function eventsOverlap(event1: Event, event2: Event): boolean {
  if (event1.event_date !== event2.event_date) return false;

  const start1 = new Date(`2000-01-01 ${event1.event_start_time}`);
  const end1 = new Date(`2000-01-01 ${event1.event_end_time}`);
  const start2 = new Date(`2000-01-01 ${event2.event_start_time}`);
  const end2 = new Date(`2000-01-01 ${event2.event_end_time}`);

  return start1 < end2 && start2 < end1;
}
```

---

## Decision 2: Data Source for Overlap Checking

**Decision**: Use existing `useEvents` hook with TanStack Query caching

**Rationale**:
- Events are already fetched and cached by `useEvents(weddingId)`
- No additional API calls needed during form input
- Real-time overlap checking without network latency
- Consistent with existing codebase patterns

**Alternatives Considered**:
1. ~~New dedicated hook `useEventOverlaps`~~ - Unnecessary complexity, events already available
2. ~~Server-side overlap validation~~ - Would require database function, adds latency to user feedback

**Implementation**:
- Pass `allEvents` from parent component (CreateEventPage/EditEventPage) to EventForm
- Filter out current event when editing (by ID)
- Run overlap check on form field changes

---

## Decision 3: Warning Badge Component Pattern

**Decision**: Create standalone `EventOverlapBadge` component using Tailwind inline classes

**Rationale**:
- Shadcn/ui Badge component doesn't support custom background colors without modification
- User specified exact styling (orange #FF9800, white text, 12px radius)
- Single-purpose component with clear responsibility
- Tailwind inline classes per constitution (no custom CSS)

**Alternatives Considered**:
1. ~~Extend Shadcn Badge variant~~ - Would require modifying shared component
2. ~~Alert component~~ - Too heavy for inline warning display

**Implementation**:
```tsx
<span className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium bg-[#FF9800] text-white">
  <AlertTriangle className="h-3 w-3 mr-1" />
  {message}
</span>
```

---

## Decision 4: Dashboard Header Venue Display

**Decision**: Conditionally render venue with bullet separator

**Rationale**:
- User specified format: `Bride & Groom / Venue Name • Wedding Date`
- `venue_name` already available from `useWedding` hook
- Graceful degradation when venue_name is null/empty
- Mobile truncation using CSS utilities

**Alternatives Considered**:
1. ~~Separate line for venue~~ - User specified inline format with bullet
2. ~~Tooltip for full venue name~~ - Not specified, would add complexity

**Implementation**:
```tsx
<p className="text-sm text-gray-500">
  {wedding.venue_name && (
    <>
      <span className="truncate max-w-[200px] inline-block align-bottom md:max-w-none">
        {wedding.venue_name}
      </span>
      <span className="mx-1 text-gray-400">•</span>
    </>
  )}
  {formatDate(wedding.wedding_date, 'MMMM d, yyyy')}
</p>
```

---

## Decision 5: Non-Blocking Warning Behavior

**Decision**: Warning badge displays but form submission remains enabled

**Rationale**:
- User explicitly stated: "I can still save overlapping events (just warned, not blocked)"
- Wedding planners may intentionally overlap events (e.g., parallel activities)
- Business decision to inform, not prevent

**Implementation**:
- Display `EventOverlapBadge` when overlaps detected
- Do NOT disable submit button
- Do NOT prevent form submission
- Log overlap decision for potential future audit

---

## Existing Code Patterns

### Event Type Definition (from `src/types/event.ts`)
```typescript
interface Event {
  id: string;
  wedding_id: string;
  event_date: string;       // ISO date "YYYY-MM-DD"
  event_start_time: string; // "HH:mm"
  event_end_time: string;   // "HH:mm"
  event_name: string;
  // ... other fields
}
```

### useEvents Hook (from `src/hooks/useEvents.ts`)
- Already fetches all events for a wedding
- Sorted by date, start time, order
- Cached by TanStack Query with `['events', weddingId]` key

### Wedding Data (from `useDashboard.ts` / `useWedding.ts`)
- Already includes `venue_name` field
- Available in dashboard context

---

## No Clarifications Needed

All technical aspects are well-defined by:
1. User-provided specifications (overlap algorithm, badge styling, header format)
2. Constitution requirements (Tailwind only, Shadcn components, TypeScript strict)
3. Existing codebase patterns (hooks, component structure, styling approach)

---

## Performance Considerations

1. **Overlap Detection**: O(n) where n = number of events per wedding (typically < 10)
2. **Re-computation**: Only on form field changes (date, start time, end time)
3. **No Network Calls**: Uses cached event data from TanStack Query
4. **Debouncing**: Not needed due to fast computation and no API calls

---

## Next Steps

Proceed to Phase 1: Generate data-model.md and contracts/ artifacts.
