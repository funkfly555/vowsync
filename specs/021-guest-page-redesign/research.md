# Research: Guest Page Redesign

**Feature**: 021-guest-page-redesign
**Date**: 2026-01-18
**Status**: Complete

## Research Summary

This is primarily a UI redesign with no new technical unknowns. All technologies are established in the codebase and constitution. Research focuses on implementation patterns for the specific UI components.

---

## 1. Expandable Card Pattern

**Decision**: Use CSS transitions with `max-height` and `overflow-hidden` for smooth expand/collapse animations.

**Rationale**:
- Native CSS transitions are performant and don't require additional libraries
- Avoids React animation libraries that add bundle size
- Tailwind CSS provides transition utilities out of the box

**Implementation Pattern**:
```tsx
// Transition classes for smooth expansion
const expandedStyles = isExpanded
  ? "max-h-[1000px] opacity-100"
  : "max-h-0 opacity-0 overflow-hidden";

// Duration and easing
className="transition-all duration-300 ease-in-out"
```

**Alternatives Considered**:
- Framer Motion: More features but adds ~30KB bundle size
- React Spring: Complex for simple expand/collapse
- CSS `height: auto`: Doesn't animate smoothly

---

## 2. Multiple Expanded Cards State Management

**Decision**: Use `Set<string>` in React state to track expanded card IDs.

**Rationale**:
- O(1) lookup, add, and delete operations
- Natural for toggle behavior
- No external state library needed for local UI state

**Implementation Pattern**:
```tsx
const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

const toggleCard = (guestId: string) => {
  setExpandedCards(prev => {
    const next = new Set(prev);
    if (next.has(guestId)) {
      next.delete(guestId);
    } else {
      next.add(guestId);
    }
    return next;
  });
};
```

**Alternatives Considered**:
- Array with includes(): O(n) lookup
- Object with boolean values: Works but Set is cleaner
- Zustand: Overkill for local UI state

---

## 3. Tab State Per Card

**Decision**: Use `Record<string, string>` to track active tab per expanded card.

**Rationale**:
- Each expanded card needs independent tab state
- Default to "basic" tab when card expands
- Clean lookup by guest ID

**Implementation Pattern**:
```tsx
const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

const setActiveTab = (guestId: string, tab: string) => {
  setActiveTabs(prev => ({ ...prev, [guestId]: tab }));
};

// Get active tab with default
const getActiveTab = (guestId: string) => activeTabs[guestId] || 'basic';
```

---

## 4. Two-Column Plus One Layout

**Decision**: CSS Grid with `grid-cols-2` for desktop, `grid-cols-1` for mobile.

**Rationale**:
- Tailwind responsive utilities handle breakpoints
- Grid gap provides consistent spacing
- Columns can have independent content height

**Implementation Pattern**:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Primary Guest Column */}
  <div className="space-y-4">
    <h4 className="font-semibold">Primary Guest</h4>
    {/* Fields */}
  </div>

  {/* Plus One Column - conditionally rendered */}
  {guest.has_plus_one && (
    <div className="space-y-4">
      <h4 className="font-semibold">Plus One</h4>
      {/* Fields */}
    </div>
  )}
</div>
```

---

## 5. Bulk Selection Pattern

**Decision**: Checkbox in collapsed card header with `Set<string>` for selected IDs.

**Rationale**:
- Same pattern as expandedCards for consistency
- Checkbox click must stop propagation to prevent card toggle
- Bulk actions bar shows when `selectedGuests.size > 0`

**Implementation Pattern**:
```tsx
const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

// Checkbox with stopPropagation
<Checkbox
  checked={selectedGuests.has(guest.id)}
  onCheckedChange={() => toggleSelection(guest.id)}
  onClick={(e) => e.stopPropagation()} // Prevent card expand
/>
```

---

## 6. Circular Table Visualization

**Decision**: CSS absolute positioning with calculated positions for seats around a circle.

**Rationale**:
- Pure CSS solution, no canvas or SVG library needed
- Positions calculated using trigonometry (sin/cos)
- Tailwind for styling, inline styles for positions only

**Implementation Pattern**:
```tsx
// Calculate seat positions around circle
const getSeatPosition = (index: number, total: number, radius: number) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
  const x = Math.cos(angle) * radius + radius;
  const y = Math.sin(angle) * radius + radius;
  return { left: x, top: y };
};

// 10 seats around circle
{Array.from({ length: 10 }, (_, i) => {
  const pos = getSeatPosition(i, 10, 120);
  return (
    <div
      key={i}
      className="absolute w-10 h-10 rounded-full flex items-center justify-center"
      style={{ left: pos.left, top: pos.top }}
    >
      {i + 1}
    </div>
  );
})}
```

---

## 7. Form Auto-Save vs Manual Save

**Decision**: Manual save with Save button in expanded card footer.

**Rationale**:
- More predictable user experience
- Prevents accidental changes
- Clear indication of unsaved changes
- Matches existing GuestModal pattern

**Implementation Pattern**:
```tsx
// Track dirty state with React Hook Form
const { formState: { isDirty }, reset } = useForm();

// Save button
<Button
  disabled={!isDirty || isSubmitting}
  onClick={handleSave}
>
  {isDirty ? 'Save Changes' : 'Saved'}
</Button>

// Reset form after save
onSuccess: () => reset(savedData)
```

---

## 8. Plus One Data Model

**Decision**: Use existing guest table fields for Plus One (no separate table).

**Rationale**:
- Existing schema already has `plus_one_*` fields
- Simpler queries without joins
- Plus One is always linked to primary guest

**Existing Fields**:
- `has_plus_one: boolean`
- `plus_one_name: string | null`
- `plus_one_confirmed: boolean`

**Gap Identified**: Current schema lacks Plus One seating, dietary, and meal fields.

**Resolution**: For this phase, Plus One uses same table/position as primary guest. Separate Plus One fields would require database migration (out of scope per spec "Out of Scope" section - uses existing schema).

---

## 9. Virtual Scrolling Trigger

**Decision**: Implement virtual scrolling when guest count exceeds 100.

**Rationale**:
- Constitution requires it for lists > 100 items
- TanStack Virtual is already an allowed library
- Cards have variable height when expanded (complicates virtualization)

**Implementation Note**: For initial release, rely on pagination (existing 50 per page). Virtual scrolling can be added if performance issues observed with many expanded cards.

---

## 10. Keyboard Navigation

**Decision**: Tab navigation between cards, Enter to expand, Space to select.

**Rationale**:
- WCAG 2.1 AA requires keyboard accessibility
- Matches common list item patterns
- Shadcn components have built-in keyboard support

**Implementation Pattern**:
```tsx
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter') toggleCard(guest.id);
    if (e.key === ' ') toggleSelection(guest.id);
  }}
  role="button"
  aria-expanded={isExpanded}
/>
```

---

## Database Field Reference

**Verified from spec and 03-DATABASE-SCHEMA.md**:

| Field | Type | Notes |
|-------|------|-------|
| `invitation_status` | TEXT | 'pending', 'invited', 'confirmed', 'declined' |
| `guest_type` | TEXT | 'adult', 'child', 'vendor', 'staff' |
| `has_plus_one` | BOOLEAN | Toggles Plus One fields visibility |
| `plus_one_name` | TEXT | Plus One's name |
| `plus_one_confirmed` | BOOLEAN | Plus One attendance confirmed |
| `table_number` | TEXT | Table assignment |
| `table_position` | INTEGER | Seat position at table |
| `dietary_restrictions` | TEXT | Dietary restrictions |
| `allergies` | TEXT | Food allergies |
| `starter_choice` | INTEGER | 1-5 meal option |
| `main_choice` | INTEGER | 1-5 meal option |
| `dessert_choice` | INTEGER | 1-5 meal option |

---

## Existing Components to Reuse

| Component | Location | Usage |
|-----------|----------|-------|
| `InvitationStatusBadge` | `src/components/guests/` | Status badges in collapsed view |
| `GuestTypeBadge` | `src/components/guests/` | Type badges in collapsed view |
| `BulkActionsBar` | `src/components/guests/` | Enhance for new actions |
| `GuestFilters` | `src/components/guests/` | Search and filter controls |
| `useGuests` | `src/hooks/` | Fetch guests with attendance |
| `useGuestMutations` | `src/hooks/` | Update guest data |

---

## Summary

All technical questions resolved. No external research required - this is a UI redesign using established patterns and existing data layer. Key decisions:

1. CSS transitions for expand/collapse (no animation library)
2. Set-based state for expanded/selected tracking
3. Grid-based two-column layout for Plus One
4. Manual save pattern (not auto-save)
5. CSS-positioned circular table visualization
6. Keyboard navigation with ARIA attributes
7. Reuse existing hooks and badge components
