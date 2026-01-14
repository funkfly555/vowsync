# Research: Wedding Dashboard

**Feature Branch**: `004-wedding-dashboard`
**Created**: 2026-01-13
**Status**: Complete

## Research Summary

This feature builds on established patterns in the VowSync codebase. No significant technical unknowns required external research. All decisions align with the project constitution.

---

## Decision 1: Dashboard Layout Pattern

**Decision**: Use a responsive grid layout with cards for each dashboard section

**Rationale**:
- Consistent with existing patterns (WeddingListPage uses card-based layout)
- Shadcn/ui Card component is already in use
- Responsive grid handles mobile/tablet/desktop breakpoints cleanly
- Each section (metrics, events, quick actions, RSVP, activity) gets its own card

**Alternatives Considered**:
1. ~~Single column layout~~ - Rejected: wastes horizontal space on desktop
2. ~~Tab-based sections~~ - Rejected: hides information, requires extra clicks
3. ~~Dashboard library (react-grid-layout)~~ - Rejected: overkill, adds dependency

---

## Decision 2: Data Fetching Strategy

**Decision**: Use TanStack Query with parallel queries in a custom `useDashboard` hook

**Rationale**:
- TanStack Query v5 is the project standard (per constitution)
- Parallel queries load all sections simultaneously for faster perceived performance
- Each query can fail independently without blocking others
- React Query caching provides offline-capable behavior

**Implementation Pattern**:
```typescript
// useDashboard.ts pattern
export function useDashboardData(weddingId: string) {
  const wedding = useWedding(weddingId);
  const events = useEvents(weddingId);
  const guestStats = useGuestStats(weddingId);
  const recentActivity = useRecentActivity(weddingId);

  return {
    wedding,
    events,
    guestStats,
    recentActivity,
    isLoading: wedding.isLoading || events.isLoading || ...
  };
}
```

**Alternatives Considered**:
1. ~~Single aggregate query~~ - Rejected: requires server-side changes, single point of failure
2. ~~useEffect with Promise.all~~ - Rejected: loses React Query benefits (caching, refetching)
3. ~~Supabase functions~~ - Rejected: adds server complexity, constitution prefers client-side

---

## Decision 3: Metric Calculations

**Decision**: Calculate metrics client-side using data from existing tables

**Rationale**:
- No new database columns needed
- Calculations are simple (counts, date diff)
- Keeps complexity in React layer where it's easier to update
- Aligns with existing patterns (event duration calculated client-side)

**Calculations**:
| Metric | Calculation | Source |
|--------|-------------|--------|
| Days until wedding | `differenceInDays(wedding_date, today)` | weddings.wedding_date |
| Guest count | `COUNT(guests)` | guests table |
| Confirmed guests | `COUNT(WHERE invitation_status = 'confirmed')` | guests.invitation_status |
| Event count | `COUNT(events)` | events table |
| Budget spent | `SUM(budget_actual)` OR `weddings.budget_actual` | weddings or budget_categories |
| Budget total | `weddings.budget_total` | weddings table |

**Alternatives Considered**:
1. ~~Postgres computed columns~~ - Rejected: requires migration, constitution says minimize DB changes
2. ~~Supabase Edge Function~~ - Rejected: adds server complexity unnecessarily

---

## Decision 4: Activity Feed Source

**Decision**: Use `activity_log` table with limit of 5 most recent entries

**Rationale**:
- Table already exists with proper schema (action_type, entity_type, description, created_at)
- RLS policy already scoped to wedding_id
- Simple query: `SELECT * FROM activity_log WHERE wedding_id = ? ORDER BY created_at DESC LIMIT 5`

**Activity Display Format**:
- Show action icon based on entity_type (guest, event, vendor)
- Show description text
- Show relative timestamp (e.g., "2 hours ago")
- Link to full activity log page

**Alternatives Considered**:
1. ~~Build activity from audit triggers~~ - Rejected: activity_log already captures this
2. ~~Show 10+ items~~ - Rejected: clutters dashboard, full page exists for detailed view

---

## Decision 5: Quick Actions Selection

**Decision**: Provide 4 primary quick actions as buttons

**Actions Selected**:
1. **Add Guest** → `/weddings/:id/guests/new` (future feature, link to guests page)
2. **Add Event** → `/weddings/:id/events/new`
3. **View Timeline** → `/weddings/:id/events`
4. **Manage Budget** → `/weddings/:id/budget` (future feature, disabled for now)

**Rationale**:
- These are the most common actions during wedding planning
- 4 buttons fit well in a 2x2 grid on mobile or horizontal row on desktop
- Links to existing routes where available, disabled state for future features

**Alternatives Considered**:
1. ~~More than 4 actions~~ - Rejected: clutters interface, dilutes focus
2. ~~Dropdown menu~~ - Rejected: hides actions, extra click required
3. ~~Context-sensitive actions~~ - Rejected: adds complexity, confusing UX

---

## Decision 6: RSVP Progress Visualization

**Decision**: Use Shadcn Progress component with segmented display

**Implementation**:
- Single progress bar showing response rate (confirmed + declined / total)
- Color segments: green for confirmed, gray for declined, empty for pending
- Text breakdown: "30 confirmed, 10 declined, 10 pending"

**Rationale**:
- Progress bar provides instant visual feedback on RSVP status
- Shadcn Progress component is already available
- Constitution requires accessible components (WCAG 2.1 AA)

**Alternatives Considered**:
1. ~~Pie chart~~ - Rejected: requires chart library, adds bundle size
2. ~~Multiple progress bars~~ - Rejected: visually complex, harder to compare
3. ~~Numbers only~~ - Rejected: lacks visual impact

---

## Decision 7: Loading States

**Decision**: Use skeleton loaders matching each dashboard section

**Rationale**:
- Constitution requires loading states for async operations
- Skeleton loaders provide better perceived performance than spinners
- Each section can load independently

**Implementation**:
- `DashboardSkeleton.tsx` component with skeleton cards
- Individual section skeletons for partial loading states
- Use Tailwind `animate-pulse` for skeleton animation

**Alternatives Considered**:
1. ~~Single full-page spinner~~ - Rejected: poor UX, blocks all content
2. ~~No loading state~~ - Rejected: violates constitution

---

## Technical Patterns

### Component Structure
```
WeddingDashboardPage
├── MetricsGrid
│   └── MetricCard (×4)
├── EventsSummary
│   └── EventSummaryCard (×N)
├── QuickActions
│   └── Button (×4)
├── RsvpProgress
│   └── Progress + Stats
└── ActivityFeed
    └── ActivityItem (×5)
```

### Hook Dependencies
```
useDashboard (orchestrator)
├── useWedding (existing)
├── useEvents (existing)
├── useGuestStats (new)
└── useRecentActivity (new)
```

### Route Integration
- Add route: `/weddings/:weddingId` → `WeddingDashboardPage`
- Update WeddingCard to link to dashboard instead of edit page

---

## No Clarifications Needed

All technical decisions align with:
- Existing codebase patterns (hooks, components, Supabase queries)
- Project constitution (tech stack, design system, testing strategy)
- Feature specification (user stories, requirements)

No external research or stakeholder clarification required.
