# Research: Guest List Page

**Feature**: 006-guest-list
**Date**: 2026-01-14

## Research Summary

All technical decisions for the Guest List Page feature have been resolved through analysis of existing codebase patterns, database schema, and spec requirements.

---

## Decision 1: Data Fetching Strategy

**Question**: How should guests be fetched - server-side pagination or client-side filtering?

**Decision**: Hybrid approach - Server-side pagination with client-side filtering for small result sets.

**Rationale**:
- Supabase supports efficient range queries via `.range(from, to)`
- Client-side filtering provides <300ms response for search (no network round-trip)
- Server-side pagination prevents loading hundreds of guests at once
- TanStack Query provides caching and prefetching

**Alternatives Considered**:
1. Full client-side - Rejected: Memory issues with large guest lists
2. Full server-side - Rejected: Slow search UX with network latency
3. Virtual scrolling only - Rejected: Overkill for 50-item pages

**Implementation**:
```typescript
// Server-side pagination
const { data, count } = await supabase
  .from('guests')
  .select('*', { count: 'exact' })
  .eq('wedding_id', weddingId)
  .order('name')
  .range(from, to);

// Client-side filtering (on fetched page)
const filtered = guests.filter(g =>
  g.name.toLowerCase().includes(search) &&
  (typeFilter === 'all' || g.guest_type === typeFilter)
);
```

---

## Decision 2: RSVP Status Calculation

**Question**: Should RSVP status be computed in the database or client?

**Decision**: Client-side calculation.

**Rationale**:
- Simpler implementation without database functions
- Real-time updates when date changes (e.g., deadline passes)
- Follows existing pattern (event duration calculated client-side in display)
- Three simple conditions: has received date, past deadline, or pending

**Alternatives Considered**:
1. Database computed column - Rejected: Complex trigger logic, date comparisons
2. Database view - Rejected: Added schema complexity for simple logic
3. Supabase Edge Function - Rejected: Overkill for display-only calculation

**Implementation**:
```typescript
export type RsvpStatus = 'yes' | 'overdue' | 'pending';

export function calculateRsvpStatus(
  rsvpReceivedDate: string | null,
  rsvpDeadline: string | null
): RsvpStatus {
  if (rsvpReceivedDate) return 'yes';
  if (rsvpDeadline && new Date(rsvpDeadline) < new Date()) return 'overdue';
  return 'pending';
}
```

---

## Decision 3: Event Filter Implementation

**Question**: How to filter guests by event attendance?

**Decision**: Server-side join query with `guest_event_attendance` table.

**Rationale**:
- The `guest_event_attendance` junction table tracks which guests attend which events
- Supabase supports nested select with `!inner` for required joins
- Filtering by event requires database-level join (not feasible client-side)

**Alternatives Considered**:
1. Fetch all attendance records client-side - Rejected: Too many records
2. Separate API call per filter - Rejected: Extra latency
3. Database view for guest+attendance - Rejected: Schema complexity

**Implementation**:
```typescript
// When eventFilter is set
const { data } = await supabase
  .from('guests')
  .select(`
    *,
    guest_event_attendance!inner(event_id, attending)
  `)
  .eq('wedding_id', weddingId)
  .eq('guest_event_attendance.event_id', eventId)
  .eq('guest_event_attendance.attending', true);
```

---

## Decision 4: Responsive Layout Approach

**Question**: How to switch between table and card layouts?

**Decision**: CSS media queries with conditional React rendering.

**Rationale**:
- Tailwind `hidden lg:block` / `block lg:hidden` patterns
- Both layouts rendered but one hidden via CSS
- Consistent with existing VowSync patterns (navigation shell uses same approach)
- Avoids JavaScript resize listener complexity

**Alternatives Considered**:
1. JavaScript `matchMedia` listener - Rejected: More complex, potential hydration issues
2. CSS-only responsive table - Rejected: Cards provide better mobile UX than cramped tables
3. Single adaptive component - Rejected: Harder to maintain and test

**Implementation**:
```tsx
{/* Desktop Table */}
<div className="hidden lg:block">
  <GuestTable guests={guests} />
</div>

{/* Mobile Cards */}
<div className="block lg:hidden">
  <GuestCardList guests={guests} />
</div>
```

---

## Decision 5: Selection State Management

**Question**: How to manage multi-select state for bulk actions?

**Decision**: Local React state with Set<string> for guest IDs.

**Rationale**:
- Set provides O(1) add/remove/has operations
- No need for global state (selection is page-scoped)
- Selection persists across filter changes within same page
- Clears on page change (expected UX behavior)

**Alternatives Considered**:
1. Zustand global store - Rejected: Over-engineering for local concern
2. Array state - Rejected: Slower lookups for large selections
3. Map with metadata - Rejected: Only need ID tracking, not additional data

**Implementation**:
```typescript
const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

const toggleGuest = (id: string) => {
  setSelectedGuests(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};

const selectAll = (guests: Guest[]) => {
  setSelectedGuests(new Set(guests.map(g => g.id)));
};

const clearSelection = () => {
  setSelectedGuests(new Set());
};
```

---

## Decision 6: Shadcn Components to Add

**Question**: Which Shadcn components are needed for this feature?

**Decision**: Add Table, Checkbox, and DropdownMenu.

**Rationale**:
- Table: Required for guest list display
- Checkbox: Required for bulk selection
- DropdownMenu: Required for filter dropdowns and bulk action menus
- All are standard Shadcn components with good accessibility

**Alternatives Considered**:
1. Custom table implementation - Rejected: Reinventing the wheel
2. TanStack Table - Rejected: Overkill for read-only display without sorting
3. HTML select for filters - Rejected: DropdownMenu provides better styling control

**Implementation**:
```bash
npx shadcn@latest add table
npx shadcn@latest add checkbox
npx shadcn@latest add dropdown-menu
```

---

## Decision 7: Search Debouncing Strategy

**Question**: How to debounce search input for performance?

**Decision**: 300ms debounce using custom hook.

**Rationale**:
- 300ms is industry standard for search (balances responsiveness and performance)
- Prevents excessive re-renders during typing
- Simple custom hook implementation

**Alternatives Considered**:
1. No debouncing - Rejected: Poor performance on every keystroke
2. lodash debounce - Rejected: Adding dependency for one function
3. Controlled with manual setTimeout - Rejected: Harder to manage cleanup

**Implementation**:
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchQuery, 300);
```

---

## Decision 8: Empty and Error States

**Question**: How to handle empty results and errors?

**Decision**: Dedicated components with consistent styling.

**Rationale**:
- Follows existing pattern from EmptyEventsState, EmptyState components
- Clear messaging guides users to next action
- Error handling via toast notifications (Constitution requirement)

**Alternatives Considered**:
1. Inline conditionals - Rejected: Harder to maintain and style
2. Single generic component - Rejected: Different messages needed for different states

**States to Handle**:
1. No guests exist → "No guests yet. Click '+ Add Guest' to get started."
2. Search/filter no results → "No guests match your search criteria"
3. API error → Toast notification with retry

---

## Resolved Clarifications

All technical decisions have been resolved. No NEEDS CLARIFICATION items remain.

| Item | Resolution |
|------|------------|
| Data fetching | Hybrid server pagination + client filtering |
| RSVP calculation | Client-side in display layer |
| Event filtering | Server-side join query |
| Responsive layout | CSS breakpoints with conditional rendering |
| Selection state | Local useState with Set |
| Components needed | Shadcn Table, Checkbox, DropdownMenu |
| Search debounce | 300ms custom hook |
| Empty/error states | Dedicated components with toasts |

---

## References

- Existing hooks: `src/hooks/useWeddings.ts`, `src/hooks/useEvents.ts`
- Existing components: `src/components/events/EventCard.tsx`, `src/components/weddings/EmptyState.tsx`
- Database schema: `docs/03-DATABASE-SCHEMA.md` (guests table at line 148)
- Constitution: `.specify/memory/constitution.md`
