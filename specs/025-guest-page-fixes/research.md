# Research: Guest Page Ad-Hoc Fixes

**Feature Branch**: `025-guest-page-fixes`
**Date**: 2026-01-21

## Executive Summary

This research documents technical decisions for the Guest Page Ad-Hoc Fixes feature. The codebase already has most infrastructure in place - this feature primarily involves modifications to existing components.

---

## Research Findings

### 1. Auto-Save Implementation

**Decision**: Modify existing debounce timer from 1000ms to 500ms

**Rationale**:
- Auto-save is already implemented in `GuestCard.tsx` with `useRef` debounce pattern
- Current debounce is 1000ms, spec requires 500ms
- Save status indicator (`SaveStatus` type) already exists: `'idle' | 'saving' | 'saved' | 'error'`

**Alternatives Considered**:
- Lodash debounce: Adds dependency, existing pattern works well
- React Query mutation debounce: Already using this pattern effectively

**Code Location**: `src/components/guests/GuestCard.tsx:121`

---

### 2. Field Reorganization

**Decision**: Move `invitation_status` and `plus_one_confirmed` from BasicInfoTab to RsvpTab

**Rationale**:
- These fields are logically RSVP-related, not basic identity info
- RsvpTab already has RSVP dates, method, and notes
- BasicInfoTab is already dense with Primary Guest and Plus One columns

**Current State**:
- `BasicInfoTab.tsx`: Contains `invitation_status` dropdown (lines 119-137) and `plus_one_confirmed` checkbox (lines 185-199)
- `RsvpTab.tsx`: Has read-only plus one RSVP summary but no editable invitation status

**Implementation**:
- Move `invitation_status` Select component to RsvpTab
- Move `plus_one_confirmed` Checkbox to RsvpTab Plus One column
- Keep fields in form data/schema unchanged (already correct)

---

### 3. Delete Functionality

**Decision**: Reuse existing DeleteGuestDialog, add delete to collapsed cards and bulk actions

**Rationale**:
- `DeleteGuestDialog.tsx` already exists with proper UI/UX
- `useGuestMutations` already has `deleteGuest` mutation
- BulkActionsBar exists but doesn't have delete option

**Current State**:
- Delete dialog: `src/components/guests/DeleteGuestDialog.tsx` (fully functional)
- Delete mutation: `useGuestMutations.deleteGuest` (working)
- Missing: Delete button on GuestCardCollapsed
- Missing: Bulk delete in BulkActionsBar

**Implementation**:
- Add `Trash2` icon button to GuestCardCollapsed
- Add bulk delete mutation to useGuestMutations
- Add "Delete Selected" to BulkActionsBar dropdown

---

### 4. Meal Options Integration

**Decision**: No changes needed - already implemented

**Rationale**:
- `useMealOptions` hook already fetches from `meal_options` table
- `MealsTab` component uses `useMealOptionsByCourse` for dropdowns
- `groupMealOptionsByCourse` utility organizes by course type

**Current State**: Fully functional in `src/hooks/useMealOptions.ts`

---

### 5. Wedding Party Fields

**Decision**: Add 3 new database columns and UI fields to BasicInfoTab

**Database Fields**:
```sql
gender TEXT CHECK (gender IN ('male', 'female'))
wedding_party_side TEXT CHECK (wedding_party_side IN ('bride', 'groom'))
wedding_party_role TEXT CHECK (wedding_party_role IN ('best_man', 'groomsmen', 'maid_of_honor', 'bridesmaids', 'parent', 'close_relative', 'relative', 'other'))
```

**UI Implementation**:
- Gender: Simple Select dropdown (Male/Female)
- Wedding Party Side: RadioGroup (Bride/Groom/None)
- Wedding Party Role: Conditional Select based on side selection

**Rationale**:
- CHECK constraints prevent invalid data at DB level
- Nullable fields allow guests outside wedding party
- Conditional role dropdown reduces cognitive load

**Role Mapping**:
| Side | Available Roles |
|------|-----------------|
| Bride | Maid of Honor, Bridesmaids, Parent, Close Relative, Relative, Other |
| Groom | Best Man, Groomsmen, Parent, Close Relative, Relative, Other |

---

### 6. Gender Icon Display

**Decision**: Use Lucide User (male) and UserCheck (female) icons

**Rationale**:
- These are the icons specified in the requirements
- Lucide React is already in use throughout the codebase
- Icons provide quick visual identification without text

**Icon Styling**:
- Size: `h-4 w-4` (consistent with other card icons)
- Color: `text-gray-600` (neutral, non-distracting)
- Position: Between TYPE badge and RSVP badge

**Alternatives Considered**:
- Venus/Mars symbols: Not in Lucide, would require custom SVG
- Text labels (M/F): Less elegant, takes more space
- Color coding: Could conflict with accessibility

---

## Type System Updates

### New Types for guest.ts

```typescript
export type Gender = 'male' | 'female';

export type WeddingPartySide = 'bride' | 'groom';

export type WeddingPartyRole =
  | 'best_man'
  | 'groomsmen'
  | 'maid_of_honor'
  | 'bridesmaids'
  | 'parent'
  | 'close_relative'
  | 'relative'
  | 'other';

// Add to Guest interface
interface Guest {
  // ... existing fields
  gender: Gender | null;
  wedding_party_side: WeddingPartySide | null;
  wedding_party_role: WeddingPartyRole | null;
}
```

### Configuration Constants

```typescript
export const GENDER_CONFIG: Record<Gender, { label: string; icon: LucideIcon }> = {
  male: { label: 'Male', icon: User },
  female: { label: 'Female', icon: UserCheck },
};

export const WEDDING_PARTY_ROLES_BY_SIDE: Record<WeddingPartySide, WeddingPartyRole[]> = {
  bride: ['maid_of_honor', 'bridesmaids', 'parent', 'close_relative', 'relative', 'other'],
  groom: ['best_man', 'groomsmen', 'parent', 'close_relative', 'relative', 'other'],
};

export const WEDDING_PARTY_ROLE_LABELS: Record<WeddingPartyRole, string> = {
  best_man: 'Best Man',
  groomsmen: 'Groomsmen',
  maid_of_honor: 'Maid of Honor',
  bridesmaids: 'Bridesmaids',
  parent: 'Parent',
  close_relative: 'Close Relative',
  relative: 'Relative',
  other: 'Other',
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/guest.ts` | Add Gender, WeddingPartySide, WeddingPartyRole types; update Guest interface |
| `src/schemas/guest.ts` | Add Zod validation for new fields |
| `src/components/guests/GuestCard.tsx` | Reduce debounce to 500ms |
| `src/components/guests/GuestCardCollapsed.tsx` | Add gender icon, add delete button |
| `src/components/guests/tabs/BasicInfoTab.tsx` | Remove invitation_status, add gender, wedding party fields |
| `src/components/guests/tabs/RsvpTab.tsx` | Add invitation_status, plus_one_confirmed |
| `src/components/guests/BulkActionsBar.tsx` | Add bulk delete option |
| `src/hooks/useGuestMutations.ts` | Add bulkDeleteGuests mutation |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration fails on existing data | Low | High | All new columns are nullable |
| Auto-save 500ms too aggressive | Low | Medium | Can easily adjust back to 1000ms |
| Gender binary causes complaints | Low | Low | Field is optional, can expand later |

---

## Conclusion

This feature is well-scoped with minimal risk. Most infrastructure exists - we're primarily moving fields between tabs and adding new optional fields. The database migration is straightforward with CHECK constraints.
