# Implementation Plan: Notifications System with Bell Icon

**Branch**: `018-notifications` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-notifications/spec.md`

## Summary

Implement a notification system that displays a bell icon in the application header with an unread count badge, a dropdown panel showing recent notifications, and a full-page notifications view with filtering. The system uses the existing `notifications` table from Phase 1, implements type-specific icons and priority-based styling, and includes a development utility for creating sample notifications.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, Lucide React, date-fns
**Storage**: Supabase PostgreSQL (`notifications` table already exists from Phase 1)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Desktop + Mobile responsive)
**Project Type**: Web application (React SPA)
**Performance Goals**: Bell icon renders within 1s, dropdown opens within 500ms
**Constraints**: No real-time subscriptions (deferred), no automated notification generation (deferred)
**Scale/Scope**: Up to 1000 notifications per user, 10 displayed in dropdown, 20 per page

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

**Gate Status**: ✅ ALL GATES PASS - No violations

## Project Structure

### Documentation (this feature)

```text
specs/018-notifications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── component-props.md
│   └── supabase-queries.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── notification.ts              # Notification TypeScript interfaces
├── hooks/
│   ├── useNotifications.ts          # Fetch notifications list
│   ├── useUnreadCount.ts            # Fetch unread count
│   └── useNotificationMutations.ts  # Mark read, delete mutations
├── components/
│   └── notifications/
│       ├── NotificationBell.tsx     # Bell icon with badge (header)
│       ├── NotificationDropdown.tsx # Dropdown panel
│       ├── NotificationCard.tsx     # Individual notification card
│       ├── NotificationIcon.tsx     # Type-specific icon helper
│       ├── NotificationFilters.tsx  # Filter controls for full page
│       └── CreateSampleNotifications.tsx  # Dev tool (testing)
├── pages/
│   └── NotificationsPage.tsx        # Full page view with filters
└── lib/
    └── notificationHelpers.ts       # Format timestamps, get colors, etc.
```

**Structure Decision**: Following VowSync established patterns - components organized by feature under `src/components/notifications/`, hooks in `src/hooks/`, types in `src/types/`, pages in `src/pages/`.

## Complexity Tracking

> No Constitution Check violations - no justifications needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
