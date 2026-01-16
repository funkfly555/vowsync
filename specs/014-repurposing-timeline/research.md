# Research: Repurposing Timeline Management

**Feature**: 014-repurposing-timeline
**Date**: 2026-01-16
**Status**: Complete

## Overview

This document captures research findings for implementing repurposing timeline management, including technology decisions, best practices, and pattern recommendations.

---

## 1. Gantt Chart Implementation

### Decision: Custom HTML/CSS Implementation

**Rationale**: Per constitution requirements (minimal dependencies, no heavy libraries), implement Gantt chart using native HTML/CSS with Tailwind classes.

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Custom HTML/CSS | Zero dependencies, full control, constitution compliant | More development time | **Selected** |
| react-gantt-timeline | Feature-rich, ready-made | Heavy dependency (200KB+), violates constitution | Rejected |
| Frappe Gantt | Lightweight | Still external dependency, limited React integration | Rejected |
| D3.js-based | Flexible, powerful | Complex, overkill for requirements | Rejected |

**Implementation Approach**:
```
Gantt Structure:
├── Header row with time markers (00:00, 06:00, 12:00, 18:00, 24:00)
├── Item rows (one per wedding item with instructions)
│   ├── Row label (item description)
│   └── Bar area (positioned absolutely)
│       └── Movement bars (pickup_time → dropoff_time)
└── Legend (status colors)

Positioning:
- Bar left offset: (pickup_time_in_minutes / 1440) * 100%
- Bar width: ((dropoff_time - pickup_time) / 1440) * 100%
```

---

## 2. Time Validation Patterns

### Decision: Client-side validation with Zod refinements

**Rationale**: Validation occurs in form submission flow, providing immediate feedback. Database CHECK constraints provide server-side backup.

**Implementation Pattern**:
```typescript
// Time parsing utility
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Validation rules from spec (R4.1, R4.2)
const validations = {
  // ERROR: Blocks save
  pickupBeforeDropoff: (pickup: string, dropoff: string) => {
    return parseTimeToMinutes(pickup) < parseTimeToMinutes(dropoff);
  },

  // WARNING: Allows save with confirmation
  pickupAfterEventEnd: (pickup: string, eventEnd: string) => {
    return parseTimeToMinutes(pickup) >= parseTimeToMinutes(eventEnd);
  },

  // WARNING: Allows save with confirmation
  dropoffBeforeEventStart: (dropoff: string, eventStart: string) => {
    return parseTimeToMinutes(dropoff) <= parseTimeToMinutes(eventStart);
  }
};
```

---

## 3. Overnight Storage Detection

### Decision: Date comparison with dialog prompt

**Rationale**: Compare event dates to detect overnight scenarios. Auto-append note to handling_notes and show dialog for storage location input.

**Implementation Pattern**:
```typescript
function detectOvernightStorage(
  fromEventDate: string,
  toEventDate: string
): boolean {
  return new Date(fromEventDate).toDateString() !==
         new Date(toEventDate).toDateString();
}

// Triggered in form onSubmit before save
// If overnight detected:
// 1. Open OvernightStorageDialog
// 2. User enters storage location
// 3. Append to handling_notes: "Overnight storage required. Location: {input}"
// 4. Continue with save
```

---

## 4. Status Workflow

### Decision: State machine with timestamp capture

**Rationale**: Clear status progression with automatic timestamp capture on transitions.

**Status Values** (from database CHECK constraint):
- `pending` - Initial state
- `in_progress` - Work started (captures `started_at`)
- `completed` - Work finished (captures `completed_at`, `completed_by`)
- `issue` - Problem occurred (captures `issue_description`)

**Transitions**:
```
pending → in_progress  (sets started_at = NOW())
pending → issue        (requires issue_description)
in_progress → completed (sets completed_at = NOW(), completed_by = user)
in_progress → issue    (requires issue_description)
completed → issue      (requires issue_description)
issue → in_progress    (clears issue_description, sets started_at if not set)
```

---

## 5. Supabase Query Patterns

### Decision: Foreign key aliasing for multiple same-table joins

**Rationale**: The `repurposing_instructions` table has two foreign keys to `events` (from_event_id, to_event_id). Supabase requires explicit aliasing.

**Query Pattern**:
```typescript
const { data } = await supabase
  .from('repurposing_instructions')
  .select(`
    *,
    wedding_items!wedding_item_id(id, description, category),
    from_event:events!from_event_id(id, event_name, event_date, event_end_time),
    to_event:events!to_event_id(id, event_name, event_date, event_start_time),
    vendors!responsible_vendor_id(id, company_name)
  `)
  .eq('wedding_id', weddingId)
  .order('pickup_time', { ascending: true });
```

---

## 6. Filter Implementation

### Decision: Client-side filtering with URL state

**Rationale**: With max ~50 instructions per wedding, client-side filtering is efficient. URL state enables shareable filter links.

**Filter Options**:
- Status: All / Pending / In Progress / Completed / Issue
- Responsible Party: All / [dynamic list from data]
- Event: All / [list of events - matches either from or to]
- Item: All / [list of items with instructions]

**URL Pattern**: `/weddings/:id/repurposing?status=pending&party=John`

---

## 7. Form Tab Structure

### Decision: 4-tab form layout in modal

**Rationale**: Group related fields for clarity without overwhelming users. Tab 4 (Status) hidden on create, shown on edit.

**Tabs**:
1. **Movement** - Item, events, locations, times
2. **Responsibility** - Party, vendor link, flags
3. **Handling** - Notes, setup/breakdown required
4. **Status** (edit only) - Status, timestamps, issue

---

## 8. Design System Compliance

### Decision: Use established color tokens and Shadcn components

**Status Badge Colors** (from design system):
```typescript
const statusColors = {
  pending: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  issue: 'bg-red-100 text-red-800 border-red-200'
};
```

**Critical Item Styling**:
```typescript
const criticalBorder = 'border-l-2 border-l-red-500';
```

**Gantt Bar Colors** (matching status):
```typescript
const ganttBarColors = {
  pending: '#2196F3',    // Blue
  in_progress: '#FF9800', // Orange
  completed: '#4CAF50',   // Green
  issue: '#F44336'        // Red
};
```

---

## 9. Accessibility Compliance

### Decision: Full WCAG 2.1 AA compliance

**Requirements**:
- All interactive elements have 44px touch targets
- Focus indicators (2px solid brand-primary)
- Keyboard navigation for all controls
- ARIA labels for Gantt chart elements
- Screen reader announcements for status changes
- Color contrast 4.5:1 minimum

**Gantt Chart Accessibility**:
```html
<div role="grid" aria-label="Item movement timeline">
  <div role="row">
    <div role="rowheader">Tables (8-foot)</div>
    <div role="gridcell" aria-label="Movement from Ceremony to Reception, 14:00 to 16:00, status pending">
      <!-- Bar element -->
    </div>
  </div>
</div>
```

---

## 10. Error Handling Patterns

### Decision: Toast notifications with retry capability

**Pattern** (from constitution):
```typescript
try {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .insert(instruction)
    .select()
    .single();

  if (error) throw error;

  toast.success('Instruction saved successfully');
  return data;
} catch (error) {
  console.error('Error saving instruction:', error);
  toast.error('Failed to save instruction. Please try again.');
  throw error;
}
```

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Gantt Chart | Custom HTML/CSS | Constitution compliance, zero dependencies |
| Validation | Zod refinements + utilities | Immediate feedback, type safety |
| Overnight Detection | Date comparison + dialog | UX-friendly prompt for storage location |
| Status Workflow | State machine pattern | Clear transitions, automatic timestamps |
| Query Pattern | Aliased joins | Required for multiple same-table FKs |
| Filtering | Client-side + URL state | Efficient for scale, shareable links |
| Form Layout | 4-tab modal | Organized fields, conditional status tab |
| Design | Design system tokens | Constitution compliance, consistency |
| Accessibility | Full WCAG 2.1 AA | Constitution requirement |
| Errors | Toast + retry | Constitution pattern |

---

## Next Steps

1. Generate `data-model.md` with TypeScript interfaces
2. Generate `contracts/repurposing-api.md` with Supabase operations
3. Generate `quickstart.md` with development setup
4. Proceed to `/speckit.tasks` for implementation tasks
