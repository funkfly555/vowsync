# Implementation Plan: Guest List Page

**Branch**: `006-guest-list` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-guest-list/spec.md`

## Summary

Implement a read-only guest list page at `/weddings/:weddingId/guests` displaying wedding guests in a responsive table (desktop) and card (mobile) layout with search, filtering by type/RSVP/event, pagination at 50 per page, RSVP status badges, and placeholder actions for Phase 6B functionality.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+
**Primary Dependencies**: React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, Lucide React, date-fns, Zod
**Storage**: Supabase PostgreSQL (`guests` and `guest_event_attendance` tables exist)
**Testing**: Manual testing with Playwright MCP only
**Target Platform**: Web (Desktop ≥1024px, Mobile <768px)
**Project Type**: Single React SPA (Vite)
**Performance Goals**: Page load <2s, search <300ms, filter <500ms
**Constraints**: 50 guests per page, real-time filtering, responsive breakpoints
**Scale/Scope**: Potentially hundreds of guests per wedding

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate calculations, proper validations | [x] |
| VII. Security | RLS, no API key exposure, input validation | [x] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] |
| XI. API Handling | Standard response format, error pattern | [x] |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] |
| XV. Prohibited | No violations of prohibited practices | [x] |

**All gates pass.** No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/006-guest-list/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── guest-api.ts     # TypeScript interfaces
└── checklists/
    └── requirements.md  # Requirements checklist
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/                    # Shadcn components (existing)
│   │   ├── table.tsx          # NEW: Table component
│   │   ├── checkbox.tsx       # NEW: Checkbox component
│   │   └── dropdown-menu.tsx  # NEW: Dropdown for filters
│   ├── guests/                # NEW: Guest-specific components
│   │   ├── GuestTable.tsx     # Desktop table view
│   │   ├── GuestCard.tsx      # Mobile card view
│   │   ├── GuestRow.tsx       # Table row component
│   │   ├── GuestFilters.tsx   # Search and filter controls
│   │   ├── GuestPagination.tsx # Pagination controls
│   │   ├── RsvpBadge.tsx      # RSVP status badge
│   │   ├── BulkActionsBar.tsx # Selection actions bar
│   │   └── EmptyGuestState.tsx # Empty state message
│   └── layout/                # Existing navigation shell
├── hooks/
│   └── useGuests.ts           # NEW: TanStack Query hook
├── pages/
│   └── GuestListPage.tsx      # NEW: Main page component
├── types/
│   └── guest.ts               # NEW: Guest TypeScript types
├── schemas/
│   └── guest.ts               # NEW: Zod validation schemas
└── lib/
    └── supabase.ts            # Existing Supabase client
```

**Structure Decision**: Follows existing VowSync patterns from wedding and event features. All guest components isolated in `src/components/guests/` with supporting hooks, types, and schemas.

## Complexity Tracking

> No violations - no complexity justifications required.

## Design Decisions

### 1. RSVP Status Calculation

The RSVP status is calculated client-side based on three database fields:

```typescript
type RsvpStatus = 'yes' | 'overdue' | 'pending';

function calculateRsvpStatus(guest: Guest): RsvpStatus {
  if (guest.rsvp_received_date) return 'yes';
  if (guest.rsvp_deadline && new Date(guest.rsvp_deadline) < new Date()) return 'overdue';
  return 'pending';
}
```

### 2. Filtering Architecture

Filters are applied client-side after initial fetch for <500ms response time:
- **Search**: Case-insensitive `name.toLowerCase().includes(query)`
- **Type Filter**: Direct match on `guest_type` field
- **RSVP Filter**: Calculated status comparison
- **Event Filter**: Requires join with `guest_event_attendance` table

### 3. Responsive Layout Strategy

- **Desktop (≥1024px)**: Table view with hover effects
- **Tablet (768-1023px)**: Table view, condensed columns
- **Mobile (<768px)**: Card view with stacked layout

### 4. Pagination Strategy

Server-side pagination with TanStack Query:
- Page size: 50 guests
- Fetch current page + prefetch next page
- Maintain filter state across page changes

## Component Architecture

```
GuestListPage
├── PageHeader (title + Add Guest button)
├── GuestFilters
│   ├── SearchInput
│   ├── TypeFilter (dropdown)
│   ├── RsvpFilter (dropdown)
│   ├── EventFilter (dropdown)
│   └── ExportButtons
├── ResultsCount ("Showing X-Y of Total")
├── BulkActionsBar (when selections exist)
│   ├── SelectionCount
│   └── ActionDropdowns
├── GuestTable (desktop) OR GuestCardList (mobile)
│   ├── GuestRow / GuestCard (repeated)
│   │   ├── Checkbox
│   │   ├── Name
│   │   ├── GuestTypeBadge
│   │   ├── RsvpBadge
│   │   ├── TableNumber
│   │   └── ActionButtons
└── GuestPagination
    ├── PageNumbers
    └── NavigationArrows
```

## API Patterns

### Fetch Guests Query

```typescript
// TanStack Query key structure
const queryKey = ['guests', weddingId, { page, filters }];

// Supabase query pattern
const fetchGuests = async (weddingId: string, page: number) => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('guests')
    .select('*', { count: 'exact' })
    .eq('wedding_id', weddingId)
    .order('name', { ascending: true })
    .range(from, to);

  if (error) throw error;
  return { guests: data, total: count };
};
```

### Event Filter Query (with join)

```typescript
const fetchGuestsForEvent = async (weddingId: string, eventId: string) => {
  const { data, error } = await supabase
    .from('guests')
    .select(`
      *,
      guest_event_attendance!inner(
        event_id,
        attending
      )
    `)
    .eq('wedding_id', weddingId)
    .eq('guest_event_attendance.event_id', eventId)
    .eq('guest_event_attendance.attending', true);

  if (error) throw error;
  return data;
};
```

## State Management

### Local State (useState)
- `searchQuery`: string
- `typeFilter`: 'all' | 'adult' | 'child' | 'vendor' | 'staff'
- `rsvpFilter`: 'all' | 'pending' | 'confirmed' | 'overdue'
- `eventFilter`: string | null (event ID)
- `selectedGuests`: Set<string> (guest IDs)
- `currentPage`: number

### Server State (TanStack Query)
- Guest list with pagination
- Events list (for filter dropdown)
- Total guest count

## Placeholder Actions

All following actions show toast "Coming in Phase 6B":
- "+ Add Guest" button
- Edit icon button
- Delete icon button
- CSV Export button
- Excel Export button
- Bulk action dropdowns (Assign Table, Send Email)

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create TypeScript types (`src/types/guest.ts`)
2. Create Zod schemas (`src/schemas/guest.ts`)
3. Create TanStack Query hook (`src/hooks/useGuests.ts`)
4. Add Shadcn table, checkbox, dropdown components

### Phase 2: Page Structure
1. Create GuestListPage with routing
2. Implement PageHeader with placeholder button
3. Create EmptyGuestState component

### Phase 3: Table Implementation
1. Create GuestTable component
2. Create GuestRow component
3. Implement RsvpBadge with status logic
4. Add hover effects and styling

### Phase 4: Search & Filters
1. Create GuestFilters component
2. Implement search with debouncing
3. Add Type, RSVP, Event filter dropdowns
4. Wire up filter state

### Phase 5: Pagination
1. Create GuestPagination component
2. Implement server-side pagination
3. Add page number highlighting

### Phase 6: Mobile Layout
1. Create GuestCard component
2. Implement responsive breakpoint switching
3. Test on mobile viewports

### Phase 7: Bulk Selection
1. Implement checkbox selection
2. Create BulkActionsBar component
3. Add placeholder action toasts

## Success Criteria Mapping

| Criterion | Implementation | Validation |
|-----------|---------------|------------|
| SC-001: <2s load | TanStack Query caching, minimal payload | Lighthouse audit |
| SC-002: <300ms search | Client-side filter, debounce | Manual timing |
| SC-003: <500ms filter | Client-side state management | Manual timing |
| SC-004: Pagination | Server-side range queries | Manual test 100+ guests |
| SC-005: Mobile cards | CSS breakpoint at 768px | Responsive testing |
| SC-006: RSVP badges | Color-coded badges (green/red/yellow) | Visual verification |
| SC-007: Placeholder toasts | Sonner toast on click | Manual test all buttons |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large guest lists slow | Server-side pagination, virtual scrolling if needed |
| Event filter complex | Pre-filter on server with join query |
| RSVP calculation edge cases | Comprehensive null checks, default to "pending" |
| Mobile layout breaks | Test at multiple viewport widths |

## Dependencies

- **Phase 5 Navigation Shell**: AppLayout wrapper (COMPLETED)
- **Database**: `guests` and `guest_event_attendance` tables (EXISTS)
- **Shadcn Components**: Table, Checkbox, DropdownMenu (TO BE ADDED)
- **Existing Hooks**: useWeddings pattern to follow (EXISTS)

## Next Steps

1. Run `/speckit.tasks` to generate task breakdown
2. Execute Phase 1 infrastructure tasks
3. Proceed through implementation phases sequentially
4. Manual testing with Playwright MCP at each phase
