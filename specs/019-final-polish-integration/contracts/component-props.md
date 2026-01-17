# Component Props Contracts: Final Polish Integration

**Feature**: 019-final-polish-integration
**Date**: 2026-01-17

---

## EventOverlapBadge Component

**File**: `src/components/events/EventOverlapBadge.tsx`

### Props Interface

```typescript
interface EventOverlapBadgeProps {
  /**
   * Array of events that overlap with the current event being edited
   * Used to generate warning message
   */
  overlappingEvents: Event[];
}
```

### Component Contract

```typescript
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
export function EventOverlapBadge({ overlappingEvents }: EventOverlapBadgeProps): JSX.Element | null;
```

### Styling Contract

| Property | Value | CSS Class |
|----------|-------|-----------|
| Background | #FF9800 | `bg-[#FF9800]` |
| Text Color | #FFFFFF | `text-white` |
| Font Size | 12px | `text-xs` |
| Font Weight | 500 | `font-medium` |
| Padding | 4px 8px | `px-2 py-1` |
| Border Radius | 12px | `rounded-xl` |
| Icon | AlertTriangle | 3x3 (h-3 w-3) |
| Icon Margin | 4px right | `mr-1` |

### Render Logic

```typescript
// Returns null if no overlapping events
if (overlappingEvents.length === 0) return null;

// Generate message based on count
const message = formatOverlapMessage(overlappingEvents);

// Render badge with icon and message
return (
  <span className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium bg-[#FF9800] text-white">
    <AlertTriangle className="h-3 w-3 mr-1" />
    {message}
  </span>
);
```

---

## EventForm Enhanced Props

**File**: `src/components/events/EventForm.tsx`

### Extended Props Interface

```typescript
interface EventFormProps {
  // Existing props (unchanged)
  onSubmit: (data: EventFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  defaultValues?: Partial<EventFormValues>;
  usedOrders?: number[];
  weddingDate?: string;
  currentEventId?: string;

  // NEW: For overlap detection
  /**
   * All events for the current wedding
   * Used to check for time overlaps when creating/editing events
   */
  allEvents?: Event[];
}
```

### Internal State

```typescript
// NEW: Track overlapping events for badge display
const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
```

### Effect Contract

```typescript
// Check for overlaps when date/time fields change
useEffect(() => {
  if (!allEvents || allEvents.length === 0) {
    setOverlappingEvents([]);
    return;
  }

  const currentEvent: Partial<Event> = {
    id: currentEventId,
    event_date: watchEventDate?.toISOString().split('T')[0],
    event_start_time: watchStartTime,
    event_end_time: watchEndTime,
  };

  const overlaps = findOverlappingEvents(currentEvent as Event, allEvents);
  setOverlappingEvents(overlaps);
}, [watchEventDate, watchStartTime, watchEndTime, allEvents, currentEventId]);
```

### Badge Placement

Badge displays after the time fields row, before the Notes field:

```tsx
{/* After time row, before notes */}
{overlappingEvents.length > 0 && (
  <EventOverlapBadge overlappingEvents={overlappingEvents} />
)}
```

---

## CreateEventPage / EditEventPage Updates

### Pass allEvents Prop

```typescript
// In CreateEventPage.tsx
const { data: allEvents } = useEvents(weddingId);

<EventForm
  {...existingProps}
  allEvents={allEvents}  // NEW
/>
```

```typescript
// In EditEventPage.tsx
const { data: allEvents } = useEvents(weddingId);

<EventForm
  {...existingProps}
  allEvents={allEvents}  // NEW
  currentEventId={eventId}  // Already exists for edit mode
/>
```

---

## WeddingDashboardPage Header Contract

### Venue Name Display

```typescript
// Conditional rendering with fallback
{isLoading ? (
  <div className="h-7 w-48 bg-gray-200 animate-pulse rounded" />
) : wedding ? (
  <>
    <h1 className="font-semibold text-xl text-gray-900">
      {wedding.bride_name} & {wedding.groom_name}
    </h1>
    <p className="text-sm text-gray-500">
      {wedding.venue_name && (
        <>
          <span className="truncate max-w-[180px] md:max-w-none inline-block align-bottom">
            {wedding.venue_name}
          </span>
          <span className="mx-1 text-gray-400">•</span>
        </>
      )}
      {formatDate(wedding.wedding_date, 'MMMM d, yyyy')}
    </p>
  </>
) : null}
```

### Mobile Truncation

| Viewport | Max Width | Behavior |
|----------|-----------|----------|
| Mobile (< 768px) | 180px | Truncate with ellipsis |
| Tablet+ (>= 768px) | none | Full venue name |

CSS implementation:
```css
/* Tailwind classes */
.truncate        /* text-overflow: ellipsis */
.max-w-[180px]   /* mobile max width */
.md:max-w-none   /* tablet+ full width */
.inline-block    /* required for truncate */
.align-bottom    /* align with text */
```
