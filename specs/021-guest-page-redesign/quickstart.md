# Quickstart: Guest Page Redesign

**Feature**: 021-guest-page-redesign
**Branch**: `021-guest-page-redesign`
**Date**: 2026-01-18

## Overview

Redesign the Guest List page from table/modal UI to inline expandable cards with a 5-tab interface. This is a **UI-only redesign** - no database schema changes required.

---

## Prerequisites

- [x] Database schema exists (`guests`, `guest_event_attendance` tables)
- [x] Existing hooks: `useGuests`, `useGuestMutations`
- [x] Existing components: `InvitationStatusBadge`, `GuestTypeBadge`, `BulkActionsBar`, `GuestFilters`
- [x] Shadcn/ui installed with Tailwind CSS
- [x] React Hook Form + Zod for form validation

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Card Animation | CSS transitions (max-height) | Native, no library needed |
| Expanded State | `Set<string>` | O(1) operations, clean API |
| Tab State | `Record<string, TabName>` | Per-card independent tabs |
| Save Pattern | Manual save button | Predictable UX, matches existing |
| Plus One Layout | CSS Grid 2-column | Responsive, native Tailwind |
| Seating Visual | CSS absolute positioning | Pure CSS, no canvas/SVG library |

---

## New Files to Create

```
src/components/guests/
├── GuestCard.tsx              # Main collapsible card container
├── GuestCardCollapsed.tsx     # Collapsed summary view
├── GuestCardExpanded.tsx      # Expanded view with tabs
├── GuestTabs.tsx              # Tab navigation component
├── tabs/
│   ├── BasicInfoTab.tsx       # Two-column basic info
│   ├── RsvpTab.tsx            # Two-column RSVP
│   ├── SeatingTab.tsx         # Two-column seating
│   ├── DietaryTab.tsx         # Two-column dietary
│   └── MealsTab.tsx           # Two-column meals
├── TableAssignModal.tsx       # Quick table assignment modal
├── SeatingArrangeModal.tsx    # Visual circular seating
└── GuestCountDisplay.tsx      # "X guests + Y plus ones = Z total"

src/hooks/
└── useBulkGuestActions.ts     # Bulk operations hook

src/pages/
└── GuestListPage.tsx          # MODIFY: Redesigned layout with cards
```

---

## State Management Pattern

```typescript
// Parent component (GuestListPage)
const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
const [activeTabs, setActiveTabs] = useState<Record<string, TabName>>({});

// Toggle card expansion
const toggleCard = (guestId: string) => {
  setExpandedCards(prev => {
    const next = new Set(prev);
    next.has(guestId) ? next.delete(guestId) : next.add(guestId);
    return next;
  });
};

// Toggle selection (for bulk actions)
const toggleSelection = (guestId: string) => {
  setSelectedGuests(prev => {
    const next = new Set(prev);
    next.has(guestId) ? next.delete(guestId) : next.add(guestId);
    return next;
  });
};
```

---

## Card Animation Pattern

```tsx
// Smooth expand/collapse with CSS transitions
<div
  className={cn(
    "transition-all duration-300 ease-in-out overflow-hidden",
    isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
  )}
>
  {/* Expanded content */}
</div>
```

---

## Two-Column Plus One Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Primary Guest Column */}
  <div className="space-y-4">
    <h4 className="font-semibold text-[#5C4B4B]">Primary Guest</h4>
    {/* Form fields */}
  </div>

  {/* Plus One Column - conditionally rendered */}
  {guest.has_plus_one && (
    <div className="space-y-4">
      <h4 className="font-semibold text-[#5C4B4B]">Plus One</h4>
      {/* Plus One fields */}
    </div>
  )}
</div>
```

---

## Circular Seating Visualization

```tsx
const getSeatPosition = (index: number, total: number, radius: number) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
  const x = Math.cos(angle) * radius + radius;
  const y = Math.sin(angle) * radius + radius;
  return { left: x, top: y };
};

// Render 10 seats around circle
{Array.from({ length: 10 }, (_, i) => {
  const pos = getSeatPosition(i, 10, 120);
  return (
    <button
      key={i}
      className="absolute w-10 h-10 rounded-full flex items-center justify-center"
      style={{ left: pos.left, top: pos.top }}
      onClick={() => assignSeat(i + 1)}
    >
      {occupiedSeats[i + 1] || (i + 1)}
    </button>
  );
})}
```

---

## Database Field Reference

| Tab | Fields |
|-----|--------|
| Basic | name, email, phone, guest_type, invitation_status, has_plus_one, plus_one_name, plus_one_confirmed |
| RSVP | rsvp_deadline, rsvp_received_date, rsvp_method, rsvp_notes |
| Seating | table_number, table_position |
| Dietary | dietary_restrictions, allergies, dietary_notes |
| Meals | starter_choice, main_choice, dessert_choice |

---

## Implementation Order

1. **GuestCard + GuestCardCollapsed** - Core card structure with expand/collapse
2. **GuestCardExpanded + GuestTabs** - Tab navigation within expanded card
3. **BasicInfoTab** - First tab with Plus One two-column layout
4. **Remaining tabs** - RSVP, Seating, Dietary, Meals (similar pattern)
5. **BulkActionsBar enhancements** - Selection state, new actions
6. **TableAssignModal** - Quick bulk table assignment
7. **SeatingArrangeModal** - Visual circular seating
8. **GuestCountDisplay** - Header count with Plus Ones
9. **GuestListPage redesign** - Integrate all components

---

## Validation Schema

```typescript
const guestEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  guest_type: z.enum(['adult', 'child', 'vendor', 'staff']),
  invitation_status: z.enum(['pending', 'invited', 'confirmed', 'declined']),
  has_plus_one: z.boolean(),
  plus_one_name: z.string().optional(),
  plus_one_confirmed: z.boolean().optional(),
  table_number: z.string().optional(),
  table_position: z.number().min(1).max(10).nullable(),
  // ... remaining fields
}).refine(
  (data) => !data.has_plus_one || (data.plus_one_name && data.plus_one_name.length > 0),
  { message: 'Plus one name is required', path: ['plus_one_name'] }
);
```

---

## Design System Values

| Token | Value | Usage |
|-------|-------|-------|
| Dusty Rose | #D4A5A5 | Primary accent, badges |
| Sage Green | #A8B8A6 | Secondary, success states |
| Soft Gold | #C9B896 | Highlights, attention |
| Charcoal Brown | #5C4B4B | Primary text |
| Warm White | #FAF8F5 | Backgrounds |

---

## Testing Checklist

- [ ] Card expand/collapse animation smooth
- [ ] Multiple cards can be expanded simultaneously
- [ ] Tab switching within expanded cards
- [ ] Form edits save correctly
- [ ] Checkbox selection doesn't trigger expand
- [ ] Bulk table assignment works
- [ ] Circular seating modal displays correctly
- [ ] Search filters cards in real-time
- [ ] Guest count includes Plus Ones
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Responsive on mobile (single column)
