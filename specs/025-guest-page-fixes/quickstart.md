# Quickstart: Guest Page Ad-Hoc Fixes

**Feature Branch**: `025-guest-page-fixes`
**Date**: 2026-01-21

## Prerequisites

- Node.js 18+
- Supabase project with existing `guests` and `meal_options` tables
- Git repository cloned

## Quick Setup

### 1. Checkout Feature Branch

```bash
git checkout 025-guest-page-fixes
npm install
```

### 2. Run Database Migration

Apply the migration via Supabase Dashboard (SQL Editor) or CLI:

```sql
-- Add 3 new columns to guests table
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));

ALTER TABLE guests
ADD COLUMN IF NOT EXISTS wedding_party_side TEXT CHECK (wedding_party_side IN ('bride', 'groom'));

ALTER TABLE guests
ADD COLUMN IF NOT EXISTS wedding_party_role TEXT CHECK (
  wedding_party_role IN (
    'best_man', 'groomsmen', 'maid_of_honor', 'bridesmaids',
    'parent', 'close_relative', 'relative', 'other'
  )
);
```

Or use Supabase MCP:
```
mcp__supabase__apply_migration with name "025_guest_page_fixes" and the SQL above
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Verify Changes

Navigate to `/guests` and test:

1. **Auto-Save**: Edit any guest field, wait 500ms, see "Saving..." indicator
2. **Field Reorganization**: Open a guest, verify RSVP tab has Invitation Status
3. **Delete**: Click trash icon on collapsed card, confirm deletion
4. **Bulk Delete**: Select multiple guests, click Delete button in bulk bar
5. **Meal Options**: Open Meals tab, verify dropdowns populated from meal_options table
6. **Wedding Party**: Open Basic Info tab, select Bride/Groom side, see role dropdown
7. **Gender Icon**: Set gender in Basic Info, collapse card, see icon between TYPE and RSVP

## Key Files Modified

| File | Changes |
|------|---------|
| `src/types/guest.ts` | Added Gender, WeddingPartySide, WeddingPartyRole types |
| `src/schemas/guest.ts` | Added Zod validation for new fields |
| `src/components/guests/GuestCard.tsx` | Reduced debounce to 500ms |
| `src/components/guests/GuestCardCollapsed.tsx` | Added gender icon, delete button |
| `src/components/guests/tabs/BasicInfoTab.tsx` | Added gender, wedding party fields; removed invitation_status |
| `src/components/guests/tabs/RsvpTab.tsx` | Added invitation_status, plus_one_confirmed |
| `src/components/guests/BulkActionsBar.tsx` | Added bulk delete option |
| `src/hooks/useGuestMutations.ts` | Added bulkDeleteGuests mutation |

## Common Issues

### Migration Fails
- Ensure no conflicting column names
- All columns are nullable (no NOT NULL constraint)

### Gender Icon Not Showing
- Verify `gender` field is populated in database
- Check Lucide React imports: `User`, `UserCheck`

### Wedding Party Role Dropdown Empty
- Must select Bride or Groom side first
- Role options are side-specific

### Auto-Save Not Triggering
- Check form is in "dirty" state (field changed)
- Watch console for "Saving..." log
- Debounce is 500ms - wait for it

## Testing Checklist

- [ ] Auto-save triggers after 500ms of inactivity
- [ ] "Saving..." indicator appears during save
- [ ] Invitation Status appears in RSVP tab (not Basic Info)
- [ ] Plus One Confirmed checkbox in RSVP tab
- [ ] Single guest delete with confirmation
- [ ] Bulk delete with confirmation showing count
- [ ] Meal dropdowns show options from meal_options table
- [ ] Gender dropdown in Basic Info
- [ ] Gender icon on collapsed cards (between TYPE and RSVP)
- [ ] Wedding Party Side radio buttons
- [ ] Wedding Party Role dropdown (conditional on side)
- [ ] Role options change based on Bride/Groom selection
- [ ] Role resets when side changes
