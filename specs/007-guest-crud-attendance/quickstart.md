# Quickstart: Guest CRUD & Event Attendance

**Feature**: 007-guest-crud-attendance
**Date**: 2026-01-14

## Prerequisites

Before starting implementation, ensure:

1. **Branch**: Working on `007-guest-crud-attendance` branch
2. **Database**: guests and guest_event_attendance tables exist (Phase 1)
3. **Foundation**: Phase 6A guest list UI is complete
4. **Events**: Events CRUD (Phase 3) is complete for event attendance features

## Setup Steps

### 1. Add Required Shadcn Components

```bash
npx shadcn@latest add tabs
npx shadcn@latest add calendar
npx shadcn@latest add popover
```

### 2. Verify Existing Components

Ensure these files exist from Phase 6A:
- `src/components/guests/GuestTable.tsx`
- `src/components/guests/GuestCard.tsx`
- `src/components/guests/GuestFilters.tsx`
- `src/components/guests/BulkActionsBar.tsx`
- `src/hooks/useGuests.ts`
- `src/types/guest.ts`

### 3. File Creation Order

Create files in this order to satisfy dependencies:

```
1. src/types/guest.ts (MODIFY - add form types)
2. src/schemas/guest.ts (NEW - Zod schemas)
3. src/hooks/useGuestMutations.ts (NEW)
4. src/components/guests/GuestBasicInfoTab.tsx (NEW)
5. src/components/guests/GuestRsvpTab.tsx (NEW)
6. src/components/guests/GuestDietaryTab.tsx (NEW)
7. src/components/guests/GuestMealTab.tsx (NEW)
8. src/components/guests/GuestEventsTab.tsx (NEW)
9. src/components/guests/GuestModal.tsx (NEW)
10. src/components/guests/DeleteGuestDialog.tsx (NEW)
11. src/components/guests/GuestTable.tsx (MODIFY - add actions)
12. src/components/guests/GuestCard.tsx (MODIFY - add actions)
13. src/components/guests/BulkActionsBar.tsx (MODIFY - add table assignment)
14. src/components/guests/GuestFilters.tsx (MODIFY - CSV export)
15. src/hooks/useAttendanceMatrix.ts (NEW)
16. src/components/guests/AttendanceMatrixRow.tsx (NEW)
17. src/components/guests/AttendanceMatrixMobile.tsx (NEW)
18. src/components/guests/AttendanceMatrix.tsx (NEW)
19. src/pages/GuestListPage.tsx (MODIFY - integrate modals)
```

## Implementation Phases

### Phase 1: Core CRUD (P1 Stories)

**Goal**: Add, Edit, Delete guests with 5-tab modal

Files to create/modify:
- Types and schemas
- GuestModal with all 5 tabs
- DeleteGuestDialog
- Mutation hooks

**Test**: Create guest → Edit guest → Delete guest

### Phase 2: Functional Filters & Export (P2 Stories)

**Goal**: Working search, filters, bulk actions, CSV export

Files to modify:
- GuestTable (edit/delete actions)
- GuestCard (edit/delete actions)
- BulkActionsBar (table assignment)
- GuestFilters (CSV export)

**Test**: Filter by type → Bulk assign table → Export CSV

### Phase 3: Attendance Matrix (P3 Story)

**Goal**: Matrix view for event attendance management

Files to create:
- useAttendanceMatrix hook
- AttendanceMatrix modal
- AttendanceMatrixRow component
- AttendanceMatrixMobile component

**Test**: Open matrix → Check attendance → Save → Verify on mobile

## Key Patterns

### Form with React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guestFormSchema, GuestFormData } from '@/schemas/guest';

const form = useForm<GuestFormData>({
  resolver: zodResolver(guestFormSchema),
  defaultValues: {
    name: '',
    guest_type: 'adult',
    // ... other defaults
  },
});
```

### TanStack Query Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const createGuestMutation = useMutation({
  mutationFn: async (data: CreateGuestRequest) => {
    const { data: guest, error } = await supabase
      .from('guests')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return guest;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
    toast.success('Guest added successfully');
  },
});
```

### Conditional Form Fields

```typescript
// RSVP Method only shows when RSVP received date is set
{form.watch('rsvp_received_date') && (
  <FormField
    control={form.control}
    name="rsvp_method"
    render={({ field }) => (
      // ... render select
    )}
  />
)}
```

### CSV Export

```typescript
function exportToCsv(guests: Guest[]) {
  const headers = CSV_EXPORT_COLUMNS.map(c => c.header);
  const rows = guests.map(guest =>
    CSV_EXPORT_COLUMNS.map(col =>
      typeof col.accessor === 'function'
        ? col.accessor(guest)
        : String(guest[col.accessor] ?? '')
    )
  );

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = generateExportFilename();
  link.click();
  URL.revokeObjectURL(url);
}
```

### Bulk UPSERT for Attendance

```typescript
async function saveAttendance(updates: AttendanceUpdatePayload[]) {
  const { error } = await supabase
    .from('guest_event_attendance')
    .upsert(
      updates.map(u => ({
        guest_id: u.guest_id,
        event_id: u.event_id,
        attending: u.attending,
        shuttle_to: u.shuttle_to,
        shuttle_from: u.shuttle_from,
      })),
      { onConflict: 'guest_id,event_id' }
    );

  if (error) throw error;
}
```

## Testing Checklist

### Manual Tests (Playwright MCP)

1. **Add Guest Flow**
   - Open modal → Fill Basic Info → Navigate tabs → Save
   - Verify toast, list refresh, data persistence

2. **Edit Guest Flow**
   - Click Edit → Modify fields → Save
   - Verify changes reflected in table

3. **Delete Guest Flow**
   - Click Delete → Confirm → Verify removed

4. **Search & Filter**
   - Type in search → Verify results
   - Select filters → Verify AND logic

5. **Bulk Table Assignment**
   - Select guests → Assign table → Verify all updated

6. **CSV Export**
   - Apply filters → Export → Verify file contents

7. **Attendance Matrix**
   - Open matrix → Toggle attendance → Save
   - Verify shuttle fields appear/hide

8. **Mobile Responsiveness**
   - Test all flows at <768px viewport

## Common Issues

### Issue: Tabs don't preserve form state
**Solution**: Wrap all tabs in single `<form>`, not per-tab forms

### Issue: Date picker shows wrong timezone
**Solution**: Use date-fns `format()` for display, store as ISO string

### Issue: UPSERT fails on attendance
**Solution**: Verify unique constraint exists on (guest_id, event_id)

### Issue: Export includes all guests, not filtered
**Solution**: Pass `filteredGuests` to export function, not raw data

## Success Criteria Validation

| Criteria | How to Test |
|----------|-------------|
| SC-001: Add guest < 2 min | Time the flow with stopwatch |
| SC-002: Search < 5 sec | Type and measure response time |
| SC-003: Bulk assign < 30 sec | Select 20+ guests, assign table |
| SC-004: Matrix update < 5 min | Update all attendance, save |
| SC-005: RSVP badges correct | Check guests with different deadlines |
| SC-006: CSV complete | Verify all columns, filtered data |
| SC-007: Toast feedback | Verify all CRUD operations show toast |
| SC-008: No horizontal scroll | Test on mobile viewport |
