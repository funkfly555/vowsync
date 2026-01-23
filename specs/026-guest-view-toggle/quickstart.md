# Quickstart Guide: Guest View Toggle Implementation

**Feature Branch**: `026-guest-view-toggle`
**Estimated Effort**: ~16-20 hours
**Prerequisites**: Existing Card View working, Supabase tables in place

## Quick Start Checklist

### Environment Setup
- [ ] Checkout feature branch: `git checkout 026-guest-view-toggle`
- [ ] Install new dependency: `npm install @tanstack/react-virtual`
- [ ] Verify dev server runs: `npm run dev`

### Phase 1: View Toggle (2 hours)

**Files to create:**
```
src/types/guest-table.ts              # New types
src/components/guests/ViewToggle.tsx  # Toggle component
```

**Files to modify:**
```
src/pages/GuestListPage.tsx           # Add toggle state
```

**Implementation Steps:**
1. Create `GuestViewMode` type in `src/types/guest-table.ts`
2. Create `ViewToggle` component (see contracts/ViewToggle.md)
3. Add view state to `GuestListPage`:
   ```tsx
   const [viewMode, setViewMode] = useState<GuestViewMode>(() =>
     (localStorage.getItem('guestsViewPreference') as GuestViewMode) || 'card'
   );

   useEffect(() => {
     localStorage.setItem('guestsViewPreference', viewMode);
   }, [viewMode]);
   ```
4. Render toggle above filters:
   ```tsx
   <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
   ```
5. Conditional render Card View or Table View based on `viewMode`

**Test:** Toggle switches, preference persists on refresh

### Phase 2: Table Structure (4 hours)

**Files to create:**
```
src/components/guests/table/index.ts
src/components/guests/table/tableColumns.ts
src/components/guests/table/GuestTableView.tsx
src/components/guests/table/GuestTableHeader.tsx
src/components/guests/table/GuestTableBody.tsx
src/components/guests/table/GuestTableRow.tsx
src/lib/guest-table-utils.ts
```

**Implementation Steps:**
1. Create `tableColumns.ts` with BASE_COLUMNS array (30 columns)
2. Create `guest-table-utils.ts` with `transformToTableRows()` function
3. Create `GuestTableHeader` with category grouping (see contract)
4. Create `GuestTableBody` as scrollable container
5. Create `GuestTableRow` as row renderer (read-only first)
6. Create `GuestTableView` as main container
7. Wire up to `GuestListPage` for `viewMode === 'table'`

**Test:** Table renders with all 30 columns, horizontal scroll works

### Phase 3: Data Fetching (3 hours)

**Files to create:**
```
src/hooks/useGuestTableData.ts
```

**Implementation Steps:**
1. Create `useGuestTableData` hook with parallel Supabase queries:
   - `guests` (all fields)
   - `events` (for column generation)
   - `guest_event_attendance` (for pivot)
   - `meal_options` (for name lookup)
2. Implement `transformToTableRows()` pivot logic
3. Implement `generateEventColumns()` for dynamic columns
4. Connect hook to `GuestTableView`
5. Add loading and error states

**Test:** Real data appears in table, event columns generated

### Phase 4: Inline Editing (4 hours)

**Files to create:**
```
src/components/guests/table/GuestTableCell.tsx
```

**Files to modify:**
```
src/components/guests/table/GuestTableRow.tsx
src/hooks/useGuestTableData.ts  # Add mutation
```

**Implementation Steps:**
1. Create `GuestTableCell` with type-specific rendering (see contract)
2. Add edit state to `GuestTableRow`
3. Implement debounced save (500ms)
4. Add `useUpdateGuestCell` mutation hook
5. Integrate mutations with optimistic updates

**Test:** Click cell to edit, changes auto-save, data persists

### Phase 5: Sorting & Filtering (3 hours)

**Files to modify:**
```
src/components/guests/table/GuestTableHeader.tsx  # Add sort/filter UI
src/components/guests/table/GuestTableView.tsx    # Add sort/filter state
src/lib/guest-table-utils.ts                      # Add sort/filter logic
```

**Implementation Steps:**
1. Add `sortConfig` state to `GuestTableView`
2. Implement sort icons in `GuestTableHeader`
3. Add `sortRows()` function to utils
4. Add `ColumnFilterPopover` component
5. Implement filter logic per column type

**Test:** Sort toggles asc/desc, filters reduce rows

### Phase 6: Column Resizing (2 hours)

**Files to create:**
```
src/components/guests/table/ColumnResizer.tsx
```

**Files to modify:**
```
src/components/guests/table/GuestTableHeader.tsx
src/components/guests/table/GuestTableView.tsx
```

**Implementation Steps:**
1. Create `ColumnResizer` drag handle component
2. Add `columnWidths` state to `GuestTableView`
3. Implement mouse drag resize logic
4. Apply widths to header and body cells

**Test:** Drag column border to resize, minimum width enforced

## Key Integration Points

### Existing Code to Reuse
- `useGuestMutations.ts` - for guest updates
- `GuestFiltersState` type - for shared filters
- `BulkActionsBar` - works with both views (uses selectedGuests)
- Supabase client - already configured

### Patterns to Follow
- Use existing Shadcn/ui components (Checkbox, Select, Input, Button)
- Follow existing color scheme (`#D4A5A5` primary)
- Use `cn()` for className merging
- Use TanStack Query patterns for data fetching

## Common Pitfalls

1. **Forgetting to handle null values** - Many guest fields are nullable
2. **Event column ordering** - Always sort by `event_order`
3. **Meal number vs name** - Display name, store number
4. **Plus one meals** - Separate fields from primary guest
5. **Large tables** - Use virtual scrolling for 500+ guests
6. **Edit mode blur** - Complete save before switching views

## Testing Checklist

### Manual Tests
- [ ] Toggle persists view preference
- [ ] Card View unchanged (zero regressions)
- [ ] All 30 columns visible in Table View
- [ ] Event columns appear for each event
- [ ] Horizontal scroll smooth
- [ ] Inline text edit works
- [ ] Checkbox toggle saves immediately
- [ ] Dropdown selection saves
- [ ] Date picker works
- [ ] Sort ascending/descending/clear
- [ ] Filter reduces visible rows
- [ ] Column resize with drag
- [ ] Search works in both views
- [ ] Bulk selection works in Table View
- [ ] Empty state shows when filtered to 0

### Performance Tests
- [ ] 100 guests renders < 500ms
- [ ] 500 guests renders < 1000ms
- [ ] Sort 500 guests < 500ms
- [ ] Horizontal scroll 60fps

## Debugging Tips

```typescript
// Log transformed data
console.log('Table rows:', rows.slice(0, 3));
console.log('Event columns:', columns.filter(c => c.category === 'event'));

// Check event attendance pivot
console.log('Guest attendance:', rows[0]?.eventAttendance);

// Verify meal lookup
console.log('Meal options:', mealOptions);
```

## Quick Reference: Column Categories

| Category | Columns | Notes |
|----------|---------|-------|
| Basic Info | 8 | name, email, phone, email_valid, guest_type, gender, wedding_party_side, wedding_party_role |
| RSVP | 8 | invitation_status, rsvp_deadline, rsvp_received_date, rsvp_method, has_plus_one, plus_one_name, plus_one_confirmed, notes |
| Seating | 2 | table_number, table_position |
| Dietary | 3 | dietary_restrictions, allergies, dietary_notes |
| Meals | 6 | starter/main/dessert for guest and plus one |
| Other | 3 | created_at, updated_at, id (read-only) |
| Events | 0-30 | 3 cols per event (attending, shuttle_to, shuttle_from) |

## File Dependency Order

Create files in this order to avoid import errors:

1. `src/types/guest-table.ts`
2. `src/lib/guest-table-utils.ts`
3. `src/components/guests/table/tableColumns.ts`
4. `src/hooks/useGuestTableData.ts`
5. `src/components/guests/ViewToggle.tsx`
6. `src/components/guests/table/GuestTableCell.tsx`
7. `src/components/guests/table/GuestTableRow.tsx`
8. `src/components/guests/table/GuestTableHeader.tsx`
9. `src/components/guests/table/GuestTableBody.tsx`
10. `src/components/guests/table/GuestTableView.tsx`
11. `src/components/guests/table/index.ts`
12. Modify `src/pages/GuestListPage.tsx`
