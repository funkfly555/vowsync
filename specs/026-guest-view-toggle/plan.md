# Implementation Plan: Guest View Toggle - Card and Table Views

**Feature Branch**: `026-guest-view-toggle`
**Created**: 2026-01-21
**Status**: Planning Complete

## Executive Summary

Add a view toggle to the Guests page allowing wedding consultants to switch between the existing Card View and a new comprehensive Table View. The Table View displays all 30+ guest fields as columns with dynamic event attendance columns, supporting inline editing, sorting, filtering, and column resizing.

## Architecture Overview

### Component Architecture

```
GuestListPage.tsx (Modified)
├── ViewToggle.tsx (NEW - Card/Table toggle buttons)
├── GuestFilters.tsx (Existing - shared between views)
├── BulkActionsBar.tsx (Existing - shared between views)
│
├── [Card View - viewMode === 'card']
│   └── GuestCard.tsx (Existing - zero changes)
│       ├── GuestCardCollapsed.tsx
│       └── GuestCardExpanded.tsx
│
└── [Table View - viewMode === 'table']
    └── GuestTableView.tsx (NEW)
        ├── GuestTableHeader.tsx (NEW - column headers with sort/filter)
        ├── GuestTableBody.tsx (NEW - virtualized rows)
        │   └── GuestTableRow.tsx (NEW - single row with inline editing)
        │       └── GuestTableCell.tsx (NEW - cell renderer by type)
        └── ColumnResizer.tsx (NEW - drag handle for column sizing)
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GuestListPage                             │
├─────────────────────────────────────────────────────────────────┤
│  State:                                                          │
│  - viewMode: 'card' | 'table' (localStorage persisted)          │
│  - filters: GuestFiltersState (shared)                          │
│  - sortConfig: { column, direction } (table only)               │
│  - columnWidths: Record<string, number> (session state)         │
│  - selectedGuests: Set<string> (shared)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    useGuestTableData (NEW)                       │
├─────────────────────────────────────────────────────────────────┤
│  Fetches and transforms data for Table View:                     │
│  - Queries guests with all 30 fields                            │
│  - Joins guest_event_attendance                                  │
│  - Joins events (for names, ordering)                           │
│  - Joins meal_options (for meal names)                          │
│  - Pivots event attendance into columns                         │
│  Returns: GuestTableRow[] with eventColumns metadata            │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Specifications

### Design System Integration

| Element | Active State | Inactive State |
|---------|--------------|----------------|
| Toggle Button | `bg-[#D4A5A5] text-white` | `bg-white border border-[#E8E8E8] text-[#2C2C2C]` |
| Table Header | `bg-[#F5F5F5]` | - |
| Table Row Hover | `bg-[#FAFAFA]` | - |
| Event Group Headers | Unique colors per event (HSL rotation) | - |

### Column Configuration

#### Base Guest Columns (30 total)

**Basic Info (8 columns)**
| Column | Field | Type | Editable | Width |
|--------|-------|------|----------|-------|
| Name | `name` | text | yes | 180px |
| Email | `email` | text | yes | 200px |
| Phone | `phone` | text | yes | 140px |
| Email Valid | `email_valid` | boolean | yes | 100px |
| Guest Type | `guest_type` | enum | yes | 120px |
| Gender | `gender` | enum | yes | 100px |
| Party Side | `wedding_party_side` | enum | yes | 120px |
| Party Role | `wedding_party_role` | enum | yes | 140px |

**RSVP (8 columns)**
| Column | Field | Type | Editable | Width |
|--------|-------|------|----------|-------|
| Invitation Status | `invitation_status` | enum | yes | 140px |
| RSVP Deadline | `rsvp_deadline` | date | yes | 140px |
| RSVP Received | `rsvp_received_date` | date | yes | 140px |
| RSVP Method | `rsvp_method` | enum | yes | 120px |
| Has Plus One | `has_plus_one` | boolean | yes | 100px |
| Plus One Name | `plus_one_name` | text | yes | 160px |
| Plus One Confirmed | `plus_one_confirmed` | boolean | yes | 100px |
| Notes | `notes` | text | yes | 200px |

**Seating (2 columns)**
| Column | Field | Type | Editable | Width |
|--------|-------|------|----------|-------|
| Table Number | `table_number` | text | yes | 120px |
| Seat Position | `table_position` | number | yes | 100px |

**Dietary (3 columns)**
| Column | Field | Type | Editable | Width |
|--------|-------|------|----------|-------|
| Dietary Restrictions | `dietary_restrictions` | text | yes | 160px |
| Allergies | `allergies` | text | yes | 160px |
| Dietary Notes | `dietary_notes` | text | yes | 200px |

**Meals (6 columns)**
| Column | Field | Type | Editable | Width |
|--------|-------|------|----------|-------|
| Starter Choice | `starter_choice` | number→name | yes | 160px |
| Main Choice | `main_choice` | number→name | yes | 160px |
| Dessert Choice | `dessert_choice` | number→name | yes | 160px |
| +1 Starter | `plus_one_starter_choice` | number→name | yes | 160px |
| +1 Main | `plus_one_main_choice` | number→name | yes | 160px |
| +1 Dessert | `plus_one_dessert_choice` | number→name | yes | 160px |

**Other (3 columns)**
| Column | Field | Type | Editable | Width |
|--------|-------|------|----------|-------|
| Created | `created_at` | datetime | no | 160px |
| Updated | `updated_at` | datetime | no | 160px |
| ID | `id` | uuid | no | 120px |

#### Dynamic Event Columns (3 per event, max 30 total)

For each event (ordered by `event_order`):
| Column | Field | Type | Editable | Width |
|--------|-------|------|----------|-------|
| {Event} - Attending | `attending` | boolean | yes | 120px |
| {Event} - Shuttle TO | `shuttle_to` | text | yes | 140px |
| {Event} - Shuttle FROM | `shuttle_from` | text | yes | 140px |

### TypeScript Interfaces

```typescript
// View mode type
type GuestViewMode = 'card' | 'table';

// Column definition for table
interface TableColumnDef {
  id: string;
  header: string;
  field: keyof Guest | string; // string for event attendance fields
  category: 'basic' | 'rsvp' | 'seating' | 'dietary' | 'meals' | 'other' | 'event';
  type: 'text' | 'boolean' | 'enum' | 'date' | 'number' | 'datetime' | 'meal';
  editable: boolean;
  width: number;
  minWidth: number;
  enumOptions?: string[];
  eventId?: string; // For event attendance columns
}

// Extended guest row with pivoted event data
interface GuestTableRowData extends Guest {
  eventAttendance: Record<string, {
    attending: boolean;
    shuttle_to: string | null;
    shuttle_from: string | null;
  }>;
}

// Sort configuration
interface SortConfig {
  column: string | null;
  direction: 'asc' | 'desc';
}

// Filter configuration (per column)
interface ColumnFilter {
  column: string;
  value: string | boolean | string[];
  operator: 'equals' | 'contains' | 'in' | 'gte' | 'lte';
}
```

### Supabase Query for Table View

```typescript
// In useGuestTableData.ts
const fetchGuestTableData = async (weddingId: string) => {
  // 1. Fetch guests with all fields
  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('name');

  // 2. Fetch events for column generation
  const { data: events } = await supabase
    .from('events')
    .select('id, event_name, event_order')
    .eq('wedding_id', weddingId)
    .order('event_order')
    .limit(10); // Max 10 events

  // 3. Fetch all attendance records for these guests
  const guestIds = guests?.map(g => g.id) || [];
  const { data: attendance } = await supabase
    .from('guest_event_attendance')
    .select('guest_id, event_id, attending, shuttle_to, shuttle_from')
    .in('guest_id', guestIds);

  // 4. Fetch meal options for name display
  const { data: mealOptions } = await supabase
    .from('meal_options')
    .select('id, option_number, meal_name, course_type')
    .eq('wedding_id', weddingId);

  // 5. Transform: pivot attendance into guest rows
  return transformToTableRows(guests, events, attendance, mealOptions);
};
```

### localStorage Schema

```typescript
// Key: 'guestsViewPreference'
// Value: 'card' | 'table'

// Reading preference
const getViewPreference = (): GuestViewMode => {
  const stored = localStorage.getItem('guestsViewPreference');
  return (stored === 'table') ? 'table' : 'card'; // Default to card
};

// Saving preference
const setViewPreference = (mode: GuestViewMode) => {
  localStorage.setItem('guestsViewPreference', mode);
};
```

## File Structure

### New Files to Create

```
src/
├── components/guests/
│   ├── ViewToggle.tsx              # Toggle buttons component
│   ├── table/
│   │   ├── index.ts                # Barrel export
│   │   ├── GuestTableView.tsx      # Main table container
│   │   ├── GuestTableHeader.tsx    # Column headers with sort/filter
│   │   ├── GuestTableBody.tsx      # Virtualized row container
│   │   ├── GuestTableRow.tsx       # Single row component
│   │   ├── GuestTableCell.tsx      # Cell renderer by type
│   │   ├── ColumnResizer.tsx       # Column resize handle
│   │   ├── ColumnFilter.tsx        # Filter dropdown per column
│   │   └── tableColumns.ts         # Column definitions config
│   └── hooks/
│       └── useGuestTableData.ts    # Data fetching for table view
├── types/
│   └── guest-table.ts              # Table-specific types
└── lib/
    └── guest-table-utils.ts        # Pivot transform, sorting, filtering
```

### Files to Modify

```
src/pages/GuestListPage.tsx         # Add view toggle state, conditional rendering
src/types/guest.ts                  # Add GuestViewMode type
```

## Implementation Phases

### Phase 1: View Toggle Infrastructure (P1)
1. Create `ViewToggle.tsx` component
2. Add view mode state to `GuestListPage.tsx`
3. Implement localStorage persistence
4. Ensure Card View renders unchanged when active

### Phase 2: Table View Basic Display (P1)
1. Create `GuestTableView.tsx` container
2. Create `GuestTableHeader.tsx` with column grouping
3. Create `GuestTableBody.tsx` with horizontal scroll
4. Create `GuestTableRow.tsx` for row rendering
5. Create `GuestTableCell.tsx` for cell type rendering
6. Implement `useGuestTableData.ts` hook
7. Define column configuration in `tableColumns.ts`

### Phase 3: Event Attendance Columns (P2)
1. Extend `useGuestTableData.ts` to fetch events
2. Generate dynamic event columns
3. Implement event column color coding
4. Handle pivot transformation for attendance data

### Phase 4: Inline Editing (P2)
1. Add edit mode state to cells
2. Implement text input editing
3. Implement checkbox toggling
4. Implement dropdown selection
5. Implement date picker
6. Add 500ms debounce auto-save
7. Integrate with `useGuestMutations.ts`

### Phase 5: Sorting and Filtering (P3)
1. Add sort state management
2. Implement column header sort icons
3. Implement sort logic (client-side for small datasets)
4. Add filter state management
5. Implement column filter dropdowns
6. Apply filters to displayed data

### Phase 6: Column Resizing (P3)
1. Create `ColumnResizer.tsx` drag handle
2. Implement drag resize logic
3. Store column widths in session state
4. Respect minimum column widths

## Performance Considerations

### Large Dataset Handling (500+ guests)
- **Virtual Scrolling**: Use `@tanstack/react-virtual` for row virtualization
- **Memoization**: Use `React.memo` for row and cell components
- **Debounced Filtering**: Client-side filter with 300ms debounce
- **Lazy Event Columns**: Only render visible columns in viewport

### Optimization Targets
- Initial render: < 500ms for 500 guests
- Sort operation: < 500ms for 500 guests
- Filter operation: < 200ms for 500 guests
- Horizontal scroll: 60fps smooth scrolling

## Testing Strategy

### Unit Tests
- ViewToggle state management
- Column definition generation
- Pivot transformation function
- Sort/filter logic
- Cell type rendering

### Integration Tests
- View toggle persistence across sessions
- Data fetching and transformation
- Inline editing with auto-save
- Sort and filter combinations

### E2E Tests (Playwright)
- Toggle between views
- Table renders all columns
- Event columns appear correctly
- Inline edit and save
- Sort by column
- Filter by column
- Column resize
- Horizontal scroll
- No Card View regressions

## Dependencies

### Existing (No Changes)
- React 18+ with TypeScript
- TanStack Query v5
- Shadcn/ui components
- Tailwind CSS v3
- Supabase client
- date-fns

### New Dependencies
- `@tanstack/react-virtual` - Row virtualization for performance
- (Optional) `@dnd-kit/core` - If implementing drag column reordering

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance with 500+ guests | Medium | High | Virtual scrolling, memoization |
| Card View regression | Low | Critical | Thorough E2E testing, feature flag |
| Complex inline editing bugs | Medium | Medium | Reuse existing form logic |
| Browser localStorage unavailable | Low | Low | Default to Card View gracefully |

## Acceptance Criteria Checklist

- [ ] Toggle buttons render at top of Guests page
- [ ] Default to Card View when no preference stored
- [ ] Persist view preference in localStorage
- [ ] Card View works identically to current implementation
- [ ] Table View shows all 30 base columns
- [ ] Columns grouped by category with headers
- [ ] Event columns generated dynamically (max 10 events)
- [ ] Event column headers color-coded
- [ ] Horizontal scroll for wide tables
- [ ] Inline editing for all editable fields
- [ ] Auto-save with 500ms debounce
- [ ] Column sorting (ascending/descending)
- [ ] Column filtering per data type
- [ ] Column resizing via drag
- [ ] Search/filter shared between views
- [ ] View switch completes pending saves
- [ ] Performance: 500 guests renders smoothly
