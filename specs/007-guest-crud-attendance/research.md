# Research: Guest CRUD & Event Attendance

**Feature**: 007-guest-crud-attendance
**Date**: 2026-01-14
**Status**: Complete

## Technology Decisions

### Form Management: React Hook Form + Zod

**Decision**: Use React Hook Form with Zod validation (existing pattern)

**Rationale**:
- Already used in wedding and event CRUD (consistent patterns)
- Excellent TypeScript integration with Zod schemas
- Minimal re-renders with uncontrolled components
- Built-in support for nested objects and arrays
- Easy validation error display per field

**Alternatives Considered**:
- Formik: Heavier, more re-renders, less TypeScript-native
- Native React state: Too verbose for 5-tab modal with 20+ fields

### Tab Management: Shadcn Tabs

**Decision**: Use Shadcn/ui Tabs component for modal navigation

**Rationale**:
- Already part of the project's component library
- WCAG 2.1 AA compliant out of the box
- Keyboard navigation (arrow keys) built-in
- Consistent styling with existing design system

**Implementation Notes**:
- Form state persists across tab switches (single form wrapping all tabs)
- Validation errors show per-tab with visual indicator
- Tab switching does not trigger form submission

### Date Picker: Shadcn Calendar + Popover

**Decision**: Add Shadcn Calendar and Popover components for date fields

**Rationale**:
- Native date inputs have inconsistent cross-browser UX
- Calendar provides visual date selection
- Popover keeps calendar in context without modal stacking
- Integrates with React Hook Form via Controller

**Components to Add**:
```bash
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add tabs
```

### Mutation Pattern: TanStack Query Mutations

**Decision**: Use TanStack Query mutations with optimistic updates

**Rationale**:
- Consistent with existing data fetching patterns
- Automatic cache invalidation after mutations
- Built-in loading/error states
- Support for optimistic updates (instant UI feedback)

**Pattern**:
```typescript
const createGuestMutation = useMutation({
  mutationFn: (data: GuestFormData) => createGuest(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
    toast.success('Guest added successfully');
  },
  onError: (error) => {
    toast.error('Failed to add guest');
  },
});
```

### Bulk Operations: Batch Supabase Updates

**Decision**: Use Supabase batch update for bulk table assignment

**Rationale**:
- Single network request for multiple guest updates
- Atomic operation (all succeed or all fail)
- Better performance than individual updates

**Implementation**:
```typescript
// Bulk update using Supabase .in() operator
const { error } = await supabase
  .from('guests')
  .update({ table_number: tableNumber })
  .in('id', guestIds);
```

### CSV Export: Browser-Native Blob API

**Decision**: Generate CSV client-side using Blob API

**Rationale**:
- No server-side processing needed
- Instant download with no network latency
- Works with filtered/visible data only
- Simple implementation with standard APIs

**Implementation**:
```typescript
function exportToCsv(guests: Guest[], filename: string) {
  const headers = ['Name', 'Email', 'Phone', 'Type', 'RSVP Status', 'Table', 'Dietary', 'Allergies'];
  const rows = guests.map(g => [g.name, g.email, g.phone, ...]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  // Trigger download
}
```

### Event Attendance Matrix: UPSERT Pattern

**Decision**: Use Supabase UPSERT for attendance batch save

**Rationale**:
- Single operation for create/update attendance records
- Conflict resolution on (guest_id, event_id) unique constraint
- Handles new attendance and updates in same operation

**Implementation**:
```typescript
const { error } = await supabase
  .from('guest_event_attendance')
  .upsert(
    attendanceRecords,
    { onConflict: 'guest_id,event_id' }
  );
```

### Mobile Matrix: Single Event View

**Decision**: Show one event at a time on mobile with dropdown selector

**Rationale**:
- Matrix with multiple columns doesn't fit mobile viewport
- Event selector provides focused view
- Swipe gestures could be added later but not MVP
- Maintains functionality without horizontal scroll

## Existing Code Analysis

### Guest Types (src/types/guest.ts)

**Existing**:
- `Guest` interface with all database fields
- `GuestType`, `InvitationStatus`, `RsvpMethod`, `RsvpStatus` enums
- `calculateRsvpStatus()` utility function
- `GuestFilters` and `GuestDisplayItem` interfaces

**Additions Needed**:
- `GuestFormData` type for form submission
- `GuestEventAttendance` interface for matrix
- Form validation schemas (Zod)

### Guest Hook (src/hooks/useGuests.ts)

**Existing**:
- `useGuests()` - fetches guest list with pagination and filters
- `useWeddingEvents()` - fetches events for filter dropdown
- Client-side search and RSVP status filtering

**Additions Needed**:
- `useGuestMutations()` - create, update, delete mutations
- `useGuest(id)` - fetch single guest for edit modal
- `useAttendanceMatrix()` - matrix data and mutations

### Guest Components (src/components/guests/)

**Existing**:
- `GuestTable.tsx` - table display (needs edit/delete actions)
- `GuestCard.tsx` - mobile card (needs edit/delete actions)
- `GuestFilters.tsx` - filter controls (export already added)
- `BulkActionsBar.tsx` - selection actions (needs table assignment)
- Various filter components (SearchInput, TypeFilter, etc.)

**New Components**:
- `GuestModal.tsx` - container with tabs
- `GuestBasicInfoTab.tsx` - basic info form fields
- `GuestRsvpTab.tsx` - RSVP form fields
- `GuestDietaryTab.tsx` - dietary form fields
- `GuestMealTab.tsx` - meal selection fields
- `GuestEventsTab.tsx` - event attendance checkboxes
- `DeleteGuestDialog.tsx` - confirmation dialog
- `AttendanceMatrix.tsx` - matrix view container
- `AttendanceMatrixRow.tsx` - single guest row
- `AttendanceMatrixMobile.tsx` - mobile single-event view

## Database Schema Verification

### guests table (existing)
All fields from Phase 1 schema are available:
- id, wedding_id, name, guest_type, email, phone
- invitation_status, attendance_confirmed
- rsvp_deadline, rsvp_received_date, rsvp_method, rsvp_notes
- has_plus_one, plus_one_name, plus_one_confirmed
- table_number, table_position
- dietary_restrictions, allergies, dietary_notes
- starter_choice, main_choice, dessert_choice
- created_at, updated_at

### guest_event_attendance table (existing)
- id, guest_id, event_id
- attending, shuttle_to, shuttle_from
- created_at, updated_at
- Foreign keys to guests and events tables
- Unique constraint on (guest_id, event_id)

## Performance Considerations

### Search Debouncing
- Current: Search filter applied client-side after fetch
- Improvement: Add 300ms debounce for search input
- Reason: Prevent excessive filtering on each keystroke

### Pagination with Filters
- Challenge: Client-side RSVP filter affects pagination accuracy
- Solution: Keep current approach (filter after fetch within page)
- Note: For 200+ guests, server-side RSVP calculation may be needed (Phase 7+)

### Matrix Loading
- Challenge: Loading all guests + all events + all attendance records
- Solution: Fetch in parallel, show loading skeleton
- Optimization: Consider virtual scrolling if >100 guests

## Accessibility Requirements

### Form Accessibility
- All inputs must have associated labels
- Error messages linked via aria-describedby
- Focus management on tab switch
- Submit button states reflect form validity

### Modal Accessibility
- Focus trap within modal
- Escape key closes modal
- Return focus to trigger element on close
- aria-modal and role="dialog"

### Table Accessibility
- Checkbox inputs have accessible labels
- Sort indicators announced to screen readers
- Row actions accessible via keyboard

## Risk Assessment

### Low Risk
- Basic CRUD operations (well-established patterns)
- Form validation (Zod + React Hook Form proven)
- Export functionality (browser-native APIs)

### Medium Risk
- Attendance matrix batch save (complex UPSERT operation)
- Mobile matrix UX (new pattern for project)
- 5-tab modal form state management

### Mitigation
- Unit test UPSERT logic with edge cases
- Test matrix on real mobile devices
- Use React Hook Form's built-in state persistence
