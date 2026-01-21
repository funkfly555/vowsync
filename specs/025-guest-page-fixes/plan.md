# Implementation Plan: Guest Page Ad-Hoc Fixes

**Branch**: `025-guest-page-fixes` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-guest-page-fixes/spec.md`

## Summary

This feature enhances the Guest page with 6 key improvements: auto-save functionality (removing save buttons), field reorganization (moving invitation status and plus one confirmed to RSVP tab), single/bulk guest deletion, meal options fetched from meal_options table, wedding party details (bride/groom side with conditional role dropdown), and gender field with icon display on cards.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (guests, meal_options tables)
**Testing**: Manual testing with Playwright MCP only
**Target Platform**: Web (modern browsers)
**Project Type**: Web SPA
**Performance Goals**: Auto-save indicator within 200ms, debounce at 500ms
**Constraints**: WCAG 2.1 AA compliance, mobile-responsive
**Scale/Scope**: ~500 guests per wedding

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
specs/025-guest-page-fixes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (migration.sql)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/                  # Shadcn components
│   └── guests/              # Guest feature components
│       ├── GuestCard.tsx           # UPDATE: Add gender icon
│       ├── GuestCardCollapsed.tsx  # UPDATE: Add gender icon, delete button
│       ├── GuestCardExpanded.tsx   # UPDATE: Save status indicator
│       ├── BulkActionsBar.tsx      # UPDATE: Add bulk delete
│       ├── DeleteGuestDialog.tsx   # EXISTS: Reuse for bulk delete
│       └── tabs/
│           ├── BasicInfoTab.tsx    # UPDATE: Add gender, wedding party, remove RSVP fields
│           └── RsvpTab.tsx         # UPDATE: Add invitation status, plus one confirmed
├── hooks/
│   ├── useGuestMutations.ts        # UPDATE: Add bulk delete mutation
│   └── useMealOptions.ts           # EXISTS: Already fetches meal options
├── types/
│   └── guest.ts                    # UPDATE: Add 3 new fields
└── schemas/
    └── guest.ts                    # UPDATE: Add Zod validation for new fields
```

**Structure Decision**: Modifying existing components in src/components/guests/ directory. No new files needed except migration SQL.

## Complexity Tracking

> No constitution violations detected. All changes align with existing patterns.

## Implementation Summary

### FIX 1: Auto-Save (Already Implemented)
Auto-save is already implemented in GuestCard.tsx with 1000ms debounce. Need to reduce to 500ms per spec.

### FIX 2: Field Reorganization
- Remove `invitation_status` from BasicInfoTab.tsx
- Remove `plus_one_confirmed` from BasicInfoTab.tsx
- Add `invitation_status` to RsvpTab.tsx
- Add `plus_one_attendance_confirmed` (checkbox) to RsvpTab.tsx

### FIX 3: Delete Functionality
- Add delete button to GuestCardCollapsed.tsx
- Add onDelete prop to BulkActionsBar.tsx
- Reuse existing DeleteGuestDialog.tsx

### FIX 4: Meal Options (Already Implemented)
The MealsTab already uses useMealOptions hook to fetch from meal_options table.

### FIX 5: Wedding Party Fields
- Add `gender` dropdown to BasicInfoTab.tsx
- Add `wedding_party_side` radio buttons to BasicInfoTab.tsx
- Add `wedding_party_role` conditional dropdown to BasicInfoTab.tsx
- Run migration to add 3 new columns to guests table

### FIX 6: Gender Icon on Cards
- Add gender icon between TYPE badge and RSVP badge in GuestCardCollapsed.tsx
- Use Lucide User icon for male, UserCheck for female
