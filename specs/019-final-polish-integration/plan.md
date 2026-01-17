# Implementation Plan: Final Polish Integration

**Branch**: `019-final-polish-integration` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-final-polish-integration/spec.md`

## Summary

This phase adds event overlap detection warnings and dashboard header improvements while ensuring production-ready polish across the application. The primary features are:

1. **Event Overlap Detection**: Real-time warnings when scheduling events with overlapping times (non-blocking)
2. **Dashboard Header Enhancement**: Display venue name alongside wedding date
3. **Production Polish**: Console error cleanup, loading states, form validation messages, responsive design verification

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (existing `events` and `weddings` tables)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Chrome, Firefox, Safari, Edge) + Mobile responsive
**Project Type**: Web application (frontend SPA)
**Performance Goals**: FCP < 1.2s, TTI < 3.5s, LCP < 2.5s, overlap detection < 1s
**Constraints**: No new dependencies, use existing patterns
**Scale/Scope**: Enhancement to existing pages - EventForm, WeddingDashboard

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette (#FF9800 warning), typography, spacing specs | [x] |
| III. Database | Using existing tables with RLS, no schema changes needed | [x] |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | Contrast ratios for warning badge (4.5:1+), keyboard nav maintained | [x] |
| VI. Business Logic | Overlap detection uses standard interval logic (start1 < end2 AND start2 < end1) | [x] |
| VII. Security | RLS already enabled on events/weddings tables | [x] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications for errors, loading states for async | [x] |
| X. Performance | Overlap check uses existing cached query data, no new API calls | [x] |
| XI. API Handling | Uses existing Supabase query patterns | [x] |
| XII. Git Workflow | Feature branch 019-final-polish-integration created | [x] |
| XIII. Documentation | JSDoc for overlap utility functions | [x] |
| XIV. Environment | No new env variables needed | [x] |
| XV. Prohibited | No violations - no custom CSS, no 'any' types, no Context API | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/019-final-polish-integration/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── component-props.md
│   └── utility-functions.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── events/
│       ├── EventForm.tsx           # MODIFY: Add overlap detection
│       └── EventOverlapBadge.tsx   # NEW: Warning badge component
├── pages/
│   └── WeddingDashboardPage.tsx    # MODIFY: Add venue name to header
├── hooks/
│   └── useEvents.ts                # EXISTING: Already fetches events
├── lib/
│   └── eventUtils.ts               # NEW: Overlap detection utilities
└── types/
    └── event.ts                    # EXISTING: Event type definition
```

**Structure Decision**: Minimal changes to existing structure. New utility file for overlap logic, new component for badge display, modifications to existing EventForm and WeddingDashboardPage.

## Complexity Tracking

> No Constitution violations requiring justification. All gates pass.

---

## Implementation Phases

### Phase 1: Event Overlap Detection (P1 - Critical)

**Files to create:**
- `src/lib/eventUtils.ts` - Overlap detection utility functions
- `src/components/events/EventOverlapBadge.tsx` - Warning badge component

**Files to modify:**
- `src/components/events/EventForm.tsx` - Add overlap checking and badge display

**Key Implementation Details:**

```typescript
// Overlap detection algorithm (from user spec)
function eventsOverlap(event1: Event, event2: Event): boolean {
  if (event1.event_date !== event2.event_date) return false;

  const start1 = new Date(`2000-01-01 ${event1.event_start_time}`);
  const end1 = new Date(`2000-01-01 ${event1.event_end_time}`);
  const start2 = new Date(`2000-01-01 ${event2.event_start_time}`);
  const end2 = new Date(`2000-01-01 ${event2.event_end_time}`);

  return start1 < end2 && start2 < end1;
}
```

**Badge Styling (from design system):**
- Background: #FF9800 (warning orange)
- Text: #FFFFFF (white)
- Font: 12px / 500 weight
- Padding: 4px 8px
- Border radius: 12px

### Phase 2: Dashboard Header Enhancement (P2)

**Files to modify:**
- `src/pages/WeddingDashboardPage.tsx` - Add venue_name display

**Format:**
- Desktop: `{bride_name} & {groom_name}` (h1) + `{venue_name} • {formatted_date}` (subtitle)
- Mobile: Truncate venue name if > 20 characters

**Note:** The `useWedding` hook already fetches `venue_name` from the weddings table.

### Phase 3: Production Polish (P2-P3)

**Console Error Cleanup:**
1. Navigate all pages with DevTools open
2. Fix any React warnings (key props, useEffect deps)
3. Remove console.log statements

**Loading States Review:**
1. Verify skeleton loaders exist on data-fetching pages
2. Verify buttons disabled during form submission

**Form Validation Messages:**
1. Review all Zod schemas for user-friendly messages
2. Update generic "Invalid" messages to specific guidance

**Responsive Design:**
1. Test all pages at 320px, 768px, 1024px viewports
2. Verify touch targets are 44px minimum
3. Verify no horizontal scroll

---

## Database Field Reference

**events table (snake_case - use EXACTLY):**
- `id` (UUID)
- `wedding_id` (UUID, FK)
- `event_date` (DATE)
- `event_start_time` (TIME)
- `event_end_time` (TIME)
- `event_name` (TEXT)
- `event_location` (TEXT)
- `event_order` (INTEGER)

**weddings table (snake_case - use EXACTLY):**
- `id` (UUID)
- `venue_name` (TEXT)
- `wedding_date` (DATE)
- `bride_name` (TEXT)
- `groom_name` (TEXT)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Overlap detection performance | Low | Medium | Use existing cached query data from useEvents |
| Mobile truncation breaks layout | Low | Low | Use CSS truncate utilities with max-width |
| Console errors from third-party | Medium | Low | Document known third-party warnings in polish notes |

---

## Success Validation

1. **Overlap Detection**: Create 2 events with overlapping times → warning badge appears
2. **Non-blocking Save**: Can still save event despite overlap warning
3. **Dashboard Header**: Venue name displays with bullet separator
4. **Mobile Responsive**: Header truncates gracefully on mobile
5. **No Console Errors**: Clean console on all page loads
6. **Performance**: All pages load < 2 seconds
