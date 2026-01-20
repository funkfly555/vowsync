# Implementation Plan: Guest Management Enhancement & Menu Configuration

**Branch**: `024-guest-menu-management` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/024-guest-menu-management/spec.md`

## Summary

Implement a Menu Configuration page for wedding meal options (5 options × 3 courses) and enhance the Guest Modal with 7 tabs: Basic Info, RSVP, Seating, Dietary, Meals (with plus one), Events (attendance), and Shuttle Booking. Database extends `meal_options` table, adds plus one meal columns to `guests`, and plus one attendance/shuttle columns to `guest_event_attendance`.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (`meal_options`, `guests`, `guest_event_attendance` tables)
**Testing**: Manual testing with Playwright MCP
**Target Platform**: Web (Desktop/Mobile responsive)
**Project Type**: web
**Performance Goals**: Modal loads 7 tabs within 500ms, Menu page CRUD operations responsive
**Constraints**: Mobile responsive at 375px width, WCAG 2.1 AA accessibility
**Scale/Scope**: Per-wedding meal options (max 15 per wedding), guest management at scale

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate calculations, proper validations | [x] |
| VII. Security | RLS, no API key exposure, input validation | [x] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] |
| XI. API Handling | Standard response format, error pattern | [x] |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] |
| XV. Prohibited | No violations of prohibited practices | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/024-guest-menu-management/
├── plan.md              # This file
├── research.md          # Technical decisions (10 decisions resolved)
├── data-model.md        # Entity relationships, TypeScript interfaces, Zod schemas
├── quickstart.md        # Implementation guide with code patterns
├── contracts/
│   └── migration.sql    # Database migration script
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── guests/
│   │   ├── GuestModal.tsx           # Enhanced 7-tab modal (768px width)
│   │   ├── tabs/
│   │   │   ├── BasicInfoTab.tsx     # Core identity fields
│   │   │   ├── RsvpTab.tsx          # RSVP status + invitation_status
│   │   │   ├── SeatingTab.tsx       # Table assignment
│   │   │   ├── DietaryTab.tsx       # Dietary restrictions
│   │   │   ├── MealsTab.tsx         # Meal selections + plus one
│   │   │   ├── EventsTab.tsx        # Event attendance + plus one
│   │   │   └── ShuttleTab.tsx       # Shuttle bookings + plus one
│   │   └── ...existing guest components
│   └── menu/
│       ├── MenuPage.tsx             # Menu configuration page
│       ├── MealOptionCard.tsx       # Individual meal option editor
│       └── CourseSection.tsx        # Course section container
├── hooks/
│   ├── useMealOptions.ts            # Meal options query + mutations
│   └── ...existing hooks
├── types/
│   ├── meal-option.ts               # MealOption TypeScript types
│   └── ...existing types
└── pages/
    └── MenuPage.tsx                 # Route: /weddings/:id/menu
```

**Structure Decision**: Web application following existing VowSync patterns. New components in `src/components/guests/tabs/` for tab content, `src/components/menu/` for menu configuration. Hooks follow existing pattern with TanStack Query.

## Complexity Tracking

> No constitutional violations. All patterns follow existing VowSync conventions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Key Technical Decisions

1. **Meal Selection Storage**: INTEGER (1-5) referencing `meal_options.option_number` - maintains backward compatibility with existing `starter_choice`, `main_choice`, `dessert_choice` fields
2. **Plus One Tracking**: Parallel columns in `guests` table for meals, `plus_one_attending` boolean in `guest_event_attendance`
3. **Shuttle Storage**: TIME and TEXT columns in `guest_event_attendance` for per-event shuttle bookings
4. **Modal Width**: 768px (increased from 600px) for 7-tab layout
5. **Course Types**: 'starter', 'main', 'dessert' enum values matching existing field naming

## Implementation Phases

### Phase 1: Database Migration
- Apply `contracts/migration.sql`
- Create `meal_options` table with RLS
- Add plus one columns to `guests` and `guest_event_attendance`

### Phase 2: Menu Configuration Page
- Create `MenuPage.tsx` with 3 course sections
- Implement `useMealOptions` hook with CRUD mutations
- Add navigation route

### Phase 3: Guest Modal Enhancement
- Expand modal to 768px width
- Implement 7-tab structure with icons
- Refactor existing content into tabs

### Phase 4: Individual Tabs
- Basic Info, RSVP, Seating, Dietary tabs (reorganize existing)
- Meals tab with plus one section
- Events tab with attendance checkboxes
- Shuttle tab with booking UI

### Phase 5: Integration & Polish
- Wire meal dropdowns to configured options
- Test plus one workflows
- Mobile responsive validation
