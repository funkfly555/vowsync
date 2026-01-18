# Implementation Plan: Dashboard Data Settings Fix

**Branch**: `020-dashboard-settings-fix` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-dashboard-settings-fix/spec.md`

## Summary

Fix the wedding dashboard to display accurate real-time data from the database (guest counts by type, vendor stats, task summary) and implement a Settings page at `/settings` with currency (ZAR/USD/EUR/GBP) and timezone preferences stored in the existing `users.preferences` JSONB column.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (existing tables: guests, vendors, vendor_payment_schedule, pre_post_wedding_tasks, users)
**Testing**: Manual testing with Playwright MCP
**Target Platform**: Web (modern browsers)
**Project Type**: web (React SPA)
**Performance Goals**: Dashboard load < 2s, Settings page load < 1s
**Constraints**: No new database migrations required
**Scale/Scope**: Single consultant use, ~10 weddings, ~500 guests per wedding

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] No migrations needed |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] Form labels, focus management |
| VI. Business Logic | Accurate calculations, proper validations | [x] Real data queries |
| VII. Security | RLS, no API key exposure, input validation | [x] Uses existing RLS |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] Sonner toasts |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] Parallel queries |
| XI. API Handling | Standard response format, error pattern | [x] TanStack Query |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] |
| XV. Prohibited | No violations of prohibited practices | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/020-dashboard-settings-fix/
├── plan.md              # This file
├── research.md          # Technical decisions (complete)
├── data-model.md        # Type definitions (complete)
├── quickstart.md        # Implementation guide (complete)
├── checklist.md         # Requirements tracking
├── spec.md              # Feature specification
└── contracts/           # Interface contracts
    ├── hooks.md         # Hook interfaces (complete)
    └── components.md    # Component contracts (complete)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── dashboard/
│       ├── DashboardStatsGrid.tsx    # MODIFY: Wire real data
│       └── DashboardQuickActions.tsx # MODIFY: Real navigation
├── contexts/
│   └── CurrencyContext.tsx           # NEW: Currency provider
├── hooks/
│   ├── useDashboard.ts               # MODIFY: Add vendor/task stats
│   ├── useGuestStats.ts              # MODIFY: Add adult/child counts
│   ├── useVendorStats.ts             # NEW: Vendor stats hook
│   ├── useTaskStats.ts               # NEW: Task stats hook
│   └── useUserPreferences.ts         # NEW: Preferences hook
├── lib/
│   └── currency.ts                   # NEW: Currency config/formatting
├── pages/
│   ├── WeddingDashboardPage.tsx      # MODIFY: Pass new props
│   └── SettingsPage.tsx              # NEW: Settings page
├── types/
│   ├── dashboard.ts                  # MODIFY: Add new interfaces
│   └── settings.ts                   # NEW: Settings types
└── App.tsx                           # MODIFY: Add Settings route
```

**Structure Decision**: Standard React SPA structure following existing patterns. New files integrate with existing hooks and components directories.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| CurrencyContext | Cross-cutting currency preference needed in many components | Prop drilling rejected - would require changes to 15+ components |

**Note**: Context usage is justified as a cross-cutting concern (similar to existing AuthContext pattern). This is not "global state" in the Redux sense - it's user preferences that affect display formatting across the app.

## Implementation Phases

### Phase 1: Foundation (Types & Utilities)
- Create `src/types/settings.ts`
- Create `src/lib/currency.ts`
- Extend `src/types/dashboard.ts`

### Phase 2: Data Layer (Hooks)
- Enhance `src/hooks/useGuestStats.ts`
- Create `src/hooks/useVendorStats.ts`
- Create `src/hooks/useTaskStats.ts`
- Create `src/hooks/useUserPreferences.ts`
- Enhance `src/hooks/useDashboard.ts`

### Phase 3: Context Layer
- Create `src/contexts/CurrencyContext.tsx`
- Integrate in `src/App.tsx`

### Phase 4: UI Layer
- Modify `src/components/dashboard/DashboardStatsGrid.tsx`
- Modify `src/components/dashboard/DashboardQuickActions.tsx`
- Modify `src/pages/WeddingDashboardPage.tsx`

### Phase 5: Settings
- Create `src/pages/SettingsPage.tsx`
- Add route in `src/App.tsx`
- Update `src/lib/navigation.ts`

### Phase 6: Currency Integration
- Audit all hardcoded currency symbols
- Update to use `useCurrency()` hook

## Key Technical Decisions

See [research.md](./research.md) for detailed analysis of:

1. **Dashboard hook architecture**: Enhance existing useDashboard.ts
2. **Guest counts**: Modify useGuestStats to add guest_type breakdown
3. **Vendor stats**: New useVendorStats hook with payment counts
4. **Task stats**: New useTaskStats hook for 7-day upcoming tasks
5. **Preferences storage**: Use existing users.preferences JSONB
6. **Currency access**: CurrencyContext for app-wide access
7. **Settings routing**: /settings as global route (not wedding-specific)
8. **Currency formatting**: lib/currency.ts with Intl.NumberFormat
9. **Timezone options**: Curated list of 7 common timezones
10. **Dashboard changes**: Minimal - wire real data, preserve structure
11. **Quick Actions**: Make functional with navigate()
12. **Currency audit**: Update all displays to use context

## Dependencies

No new npm packages required. Uses existing:
- TanStack Query v5
- React Hook Form
- Zod
- Shadcn/ui Select
- Sonner (toasts)
- Supabase client

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Currency context re-renders | Memoize context value |
| Query waterfall for stats | Parallel queries with Promise.all |
| Stale dashboard data | TanStack Query refetch on window focus |
| Missing guest_type values | Default to 'adult' if null |

## Success Criteria

- [ ] Guest counts match database (adults + children)
- [ ] Vendor counts match database
- [ ] Pending payments count accurate
- [ ] Task counts reflect next 7 days
- [ ] Settings page accessible at /settings
- [ ] Currency preference persists across sessions
- [ ] All monetary values use selected currency
- [ ] No hardcoded stats values
- [ ] TypeScript strict mode passes
- [ ] Production build succeeds
