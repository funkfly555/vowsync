# Research: Events Management CRUD

**Feature**: 003-events-crud
**Date**: 2026-01-13
**Status**: Complete

## Research Tasks

### 1. Database Schema Analysis

**Question**: What is the existing events table structure and constraints?

**Findings**:
The `events` table already exists from Phase 1 with the following structure:

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| wedding_id | uuid | NO | - | FK to weddings |
| event_order | integer | NO | - | 1-10 (CHECK constraint) |
| event_name | text | NO | - | Required |
| event_type | text | YES | - | CHECK: ceremony/reception/rehearsal_dinner/welcome_party/brunch/other |
| event_date | date | NO | - | Required |
| event_start_time | time | NO | - | Required |
| event_end_time | time | NO | - | Required |
| event_location | text | NO | - | Required |
| expected_guests_adults | integer | YES | 0 | Guest count |
| expected_guests_children | integer | YES | 0 | Guest count |
| duration_hours | numeric | YES | - | Generated column (auto-calculated) |
| notes | text | YES | - | Optional |
| created_at | timestamptz | YES | now() | Auto timestamp |
| updated_at | timestamptz | YES | now() | Auto timestamp |

**Constraints**:
- `events_pkey`: Primary key on `id`
- `events_wedding_id_fkey`: Foreign key to weddings(id) ON DELETE CASCADE
- `events_wedding_id_event_order_key`: UNIQUE(wedding_id, event_order)
- `events_event_order_check`: CHECK (event_order >= 1 AND event_order <= 10)
- `events_event_type_check`: CHECK (event_type IN ('ceremony', 'reception', 'rehearsal_dinner', 'welcome_party', 'brunch', 'other'))

**Decision**: Use existing table as-is. All required columns and constraints exist.

---

### 2. Duration Calculation Pattern

**Question**: How should duration_hours be calculated and displayed?

**Research**:
- Database stores `duration_hours` as numeric (DECIMAL)
- Formula: `EXTRACT(EPOCH FROM (event_end_time - event_start_time)) / 3600`
- This is a generated column in PostgreSQL

**Decision**:
- **Backend**: Use database-generated column (already calculates on save)
- **Frontend**: Calculate locally for real-time preview using date-fns
- **Display Format**: "X.X hours" or "Xh Xm" for fractional hours

**Implementation**:
```typescript
// Frontend calculation for preview
function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMins] = startTime.split(':').map(Number);
  const [endHours, endMins] = endTime.split(':').map(Number);
  const startMinutes = startHours * 60 + startMins;
  const endMinutes = endHours * 60 + endMins;
  return (endMinutes - startMinutes) / 60;
}

// Display formatting
function formatDuration(hours: number): string {
  if (hours === Math.floor(hours)) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return wholeHours > 0 ? `${wholeHours}h ${minutes}m` : `${minutes}m`;
}
```

---

### 3. Event Color Mapping

**Question**: How to map event_order to colors from design system?

**Research**: Constitution defines 7 event colors:
```css
--event-1: #E8B4B8 (pink)
--event-2: #F5E6D3 (cream)
--event-3: #C9D4C5 (sage)
--event-4: #E5D4EF (lavender)
--event-5: #FFE5CC (peach)
--event-6: #D4E5F7 (blue)
--event-7: #F7D4E5 (rose)
```

**Decision**: Create constant array mapping order to colors. Cycle back for orders 8-10.

**Implementation**:
```typescript
const EVENT_COLORS = [
  '#E8B4B8', // Order 1 - pink
  '#F5E6D3', // Order 2 - cream
  '#C9D4C5', // Order 3 - sage
  '#E5D4EF', // Order 4 - lavender
  '#FFE5CC', // Order 5 - peach
  '#D4E5F7', // Order 6 - blue
  '#F7D4E5', // Order 7 - rose
];

function getEventColor(order: number): string {
  return EVENT_COLORS[(order - 1) % EVENT_COLORS.length];
}
```

---

### 4. Timeline Visual Design

**Question**: How to implement visual timeline with connecting lines?

**Research**: Common patterns for vertical timelines:
1. Flexbox column layout
2. Pseudo-elements for connecting lines
3. Absolute positioning for timeline rail

**Decision**: Use Tailwind with pseudo-elements for connecting lines

**Implementation Approach**:
```tsx
// Timeline container with vertical line
<div className="relative">
  {/* Vertical line */}
  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

  {/* Event cards */}
  {events.map((event, index) => (
    <div key={event.id} className="relative flex gap-4 mb-4">
      {/* Circle indicator */}
      <div
        className="w-4 h-4 rounded-full z-10 mt-4 ml-6"
        style={{ backgroundColor: getEventColor(event.event_order) }}
      />
      {/* Event card */}
      <EventCard event={event} />
    </div>
  ))}
</div>
```

---

### 5. Form Validation Pattern

**Question**: How to handle complex validations (unique order, time comparison, date warning)?

**Research**: Existing wedding form uses React Hook Form + Zod

**Decision**: Follow same pattern with custom refinements

**Validation Rules**:
1. **Unique order**: Fetch existing orders, validate on client, let DB constraint catch race conditions
2. **Time comparison**: Zod refine comparing start/end
3. **Date warning**: Non-blocking warning via separate state (not form error)

**Implementation**:
```typescript
const eventFormSchema = z.object({
  event_order: z.number().min(1).max(10),
  event_name: z.string().min(1, 'Event name is required'),
  event_type: z.enum(['ceremony', 'reception', 'rehearsal_dinner', 'welcome_party', 'brunch', 'other']),
  event_date: z.date(),
  event_start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  event_end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  event_location: z.string().min(1, 'Location is required'),
  notes: z.string().optional(),
}).refine(
  (data) => data.event_end_time > data.event_start_time,
  { message: 'End time must be after start time', path: ['event_end_time'] }
);
```

---

### 6. RLS Pattern for Child Tables

**Question**: How to access events via RLS when filtering by wedding?

**Research**: Constitution defines child table RLS pattern:
```sql
CREATE POLICY "Users can view events of their weddings"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = events.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );
```

**Verification**: RLS is already enabled on events table from Phase 1.

**Decision**: Use standard Supabase queries - RLS handles authorization automatically.

---

### 7. Guest Count Display

**Question**: How to show guest count on event cards?

**Research**: Events table has `expected_guests_adults` and `expected_guests_children` columns.

**Decision**:
- Display combined count: `adults + children`
- Format: "X guests" (or "X adults, Y children" in detailed view)
- Default to 0 if null

**Implementation**:
```typescript
function getGuestCount(event: Event): number {
  return (event.expected_guests_adults || 0) + (event.expected_guests_children || 0);
}
```

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Database | Use existing events table | Schema matches requirements |
| Duration calc | DB generated + frontend preview | Real-time UX with accurate storage |
| Colors | Array with modulo cycling | Covers all 10 orders with 7 colors |
| Timeline | Tailwind pseudo-elements | Simple, maintainable approach |
| Validation | Zod with custom refinements | Consistent with wedding forms |
| RLS | Standard queries | Existing policies handle auth |
| Guest count | Sum adults + children | Simple combined display |

## Dependencies Identified

1. **Existing Components**: Reuse form field patterns from wedding forms
2. **Existing Hooks**: Follow useWeddings pattern for useEvents
3. **Existing Types**: Extend typing patterns from wedding.ts
4. **date-fns**: Already installed, use for time parsing

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Duplicate order race condition | DB unique constraint catches; show error toast |
| Duration calculation mismatch | Use same formula client/server |
| Mobile timeline layout | Test responsive design early |
