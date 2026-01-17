# Data Model: Final Polish Integration

**Feature**: 019-final-polish-integration
**Date**: 2026-01-17

## Overview

This feature uses existing database tables. No schema changes required.

---

## Existing Entities (Reference Only)

### Event Entity

**Table**: `events`
**Source**: 03-DATABASE-SCHEMA.md (lines 109-137)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `wedding_id` | UUID | Foreign key to weddings |
| `event_date` | DATE | Date of the event |
| `event_start_time` | TIME | Start time (HH:mm:ss) |
| `event_end_time` | TIME | End time (HH:mm:ss) |
| `event_name` | TEXT | Name/title of event |
| `event_location` | TEXT | Venue/location |
| `event_order` | INTEGER | Order in timeline (1-10) |
| `event_type` | TEXT | ceremony, reception, etc. |
| `notes` | TEXT | Optional notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Overlap Detection Fields Used**:
- `event_date` - For same-day comparison
- `event_start_time` - Interval start
- `event_end_time` - Interval end
- `event_name` - Display in warning message
- `id` - Exclude self when editing

---

### Wedding Entity

**Table**: `weddings`
**Source**: 03-DATABASE-SCHEMA.md (lines 61-103)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `bride_name` | TEXT | Bride's name |
| `groom_name` | TEXT | Groom's name |
| `wedding_date` | DATE | Wedding date |
| `venue_name` | TEXT | Primary venue name |
| `consultant_id` | UUID | FK to auth.users |
| `budget_total` | NUMERIC | Total budget |
| `budget_actual` | NUMERIC | Actual spent |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Dashboard Header Fields Used**:
- `bride_name` - Display in header
- `groom_name` - Display in header
- `venue_name` - NEW: Display in subtitle
- `wedding_date` - Display formatted date

---

## TypeScript Interfaces

### Existing Event Interface

```typescript
// From src/types/event.ts
interface Event {
  id: string;
  wedding_id: string;
  event_order: number;
  event_name: string;
  event_type: EventType | null;
  event_date: string;       // ISO date "YYYY-MM-DD"
  event_start_time: string; // "HH:mm"
  event_end_time: string;   // "HH:mm"
  event_location: string;
  expected_guests_adults: number;
  expected_guests_children: number;
  duration_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### Overlap Detection Type

```typescript
// NEW: For overlap utility functions
interface EventOverlapInfo {
  /** The event that overlaps */
  event: Event;
  /** Formatted message: "Overlaps with {event_name}" */
  message: string;
}
```

---

## Data Flow

### Overlap Detection Flow

```
EventForm (user changes date/time)
    │
    ▼
useEffect detects field changes
    │
    ▼
findOverlappingEvents(currentEvent, allEvents)
    │
    ├── Filter: same event_date
    ├── Filter: time ranges intersect
    └── Exclude: current event ID (edit mode)
    │
    ▼
setOverlappingEvents(results)
    │
    ▼
EventOverlapBadge renders warning
```

### Dashboard Header Flow

```
WeddingDashboardPage loads
    │
    ▼
useDashboard(weddingId)
    │
    ▼
useWedding fetches wedding data
    │
    ▼
wedding.venue_name available
    │
    ▼
Render: "{venue_name} • {formatted_date}"
```

---

## Validation Rules

### Event Time Validation

| Rule | Description |
|------|-------------|
| Start before End | `event_start_time < event_end_time` (existing) |
| Same Day | Overlap only checked for events on same `event_date` |
| Exclude Self | When editing, exclude current event from overlap check |

### Overlap Detection Rules

| Rule | Logic |
|------|-------|
| Same Date | `event1.event_date === event2.event_date` |
| Time Overlap | `start1 < end2 AND start2 < end1` |
| Non-blocking | Warning only, submission allowed |

---

## No Schema Changes

This feature requires **NO database migrations**:
- All required fields already exist
- `venue_name` exists in weddings table
- Event time fields exist in events table
- RLS policies already in place
