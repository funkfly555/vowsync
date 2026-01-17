# Quickstart: Final Polish Integration

**Feature**: 019-final-polish-integration
**Date**: 2026-01-17

---

## Overview

This feature adds:
1. Event overlap detection with warning badges
2. Venue name display in dashboard header
3. Production polish (console errors, loading states, responsive design)

---

## Prerequisites

- Existing VowSync development environment
- No new dependencies required
- No database migrations required

---

## Implementation Checklist

### Phase 1: Event Overlap Detection (P1)

```bash
# Create new utility file
touch src/lib/eventUtils.ts

# Create new component
touch src/components/events/EventOverlapBadge.tsx

# Modify existing files
# - src/components/events/EventForm.tsx
# - src/pages/CreateEventPage.tsx
# - src/pages/EditEventPage.tsx
```

**Steps:**

1. **Create `src/lib/eventUtils.ts`**
   - `eventsOverlap(event1, event2)` - interval overlap check
   - `findOverlappingEvents(current, all)` - filter overlapping events
   - `formatOverlapMessage(events)` - generate warning text

2. **Create `src/components/events/EventOverlapBadge.tsx`**
   - Display warning badge with orange background (#FF9800)
   - Show overlapping event names
   - Use AlertTriangle icon

3. **Modify `src/components/events/EventForm.tsx`**
   - Add `allEvents` prop
   - Add useEffect to check overlaps on field change
   - Render EventOverlapBadge above notes field

4. **Update `src/pages/CreateEventPage.tsx`**
   - Pass `allEvents` from useEvents hook to EventForm

5. **Update `src/pages/EditEventPage.tsx`**
   - Pass `allEvents` from useEvents hook to EventForm

### Phase 2: Dashboard Header (P2)

```bash
# Modify existing file
# - src/pages/WeddingDashboardPage.tsx
```

**Steps:**

1. **Modify `src/pages/WeddingDashboardPage.tsx`**
   - Add venue_name to header subtitle
   - Format: `{venue_name} • {date}`
   - Add mobile truncation with max-width

### Phase 3: Production Polish (P2-P3)

**Console Error Cleanup:**
- Navigate all pages with DevTools Console open
- Fix any React warnings
- Remove console.log statements

**Loading States:**
- Verify skeleton loaders on all data pages
- Verify button disabled states during submission

**Form Validation:**
- Review Zod schema error messages
- Update generic messages to specific guidance

**Responsive Design:**
- Test at 320px, 768px, 1024px viewports
- Verify 44px minimum touch targets
- Verify no horizontal scroll

---

## Testing Scenarios

### Overlap Detection Tests

| Test | Steps | Expected |
|------|-------|----------|
| Create overlapping event | Create event 14:00-16:00, then another 15:00-17:00 same date | Warning badge shows |
| Save despite warning | Click Save with overlap warning showing | Event saves successfully |
| Edit existing event | Change time to overlap with another | Warning appears |
| Different dates | Create events with same times but different dates | No warning |
| Back-to-back events | Create 14:00-15:00 and 15:00-16:00 | No warning (no overlap) |

### Dashboard Header Tests

| Test | Steps | Expected |
|------|-------|----------|
| Venue displays | View wedding with venue_name set | Venue shows with bullet separator |
| No venue fallback | View wedding without venue_name | Only date shows, no bullet |
| Mobile truncation | View on 320px viewport with long venue | Truncates with ellipsis |

---

## Key Files

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/eventUtils.ts` | CREATE | Overlap detection utilities |
| `src/components/events/EventOverlapBadge.tsx` | CREATE | Warning badge component |
| `src/components/events/EventForm.tsx` | MODIFY | Add overlap checking |
| `src/pages/CreateEventPage.tsx` | MODIFY | Pass allEvents prop |
| `src/pages/EditEventPage.tsx` | MODIFY | Pass allEvents prop |
| `src/pages/WeddingDashboardPage.tsx` | MODIFY | Add venue to header |

---

## Design System Reference

### Warning Badge
```css
background: #FF9800;
color: #FFFFFF;
font-size: 12px;
font-weight: 500;
padding: 4px 8px;
border-radius: 12px;
```

### Header Typography
- h1: 20px / 600 weight (existing)
- subtitle: 14px / 400 weight (existing)
- bullet: U+2022 with gray color

---

## Validation Commands

```bash
# TypeScript check
npm run typecheck

# Build check
npm run build

# Dev server
npm run dev
```

---

## Success Criteria

- [ ] Overlap warning appears within 1 second of time field change
- [ ] Warning badge matches design system (#FF9800 orange)
- [ ] Events can be saved despite overlap warning
- [ ] Dashboard shows venue name with bullet separator
- [ ] Mobile viewport truncates long venue names
- [ ] No console errors on any page
- [ ] All pages load within 2 seconds
