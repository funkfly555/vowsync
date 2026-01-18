# Requirements Checklist: Dashboard Data Settings Fix

**Feature**: 020-dashboard-settings-fix
**Created**: 2026-01-18
**Completed**: 2026-01-18

## User Stories

### US1: Accurate Guest Count Display (P1) 🎯 MVP
- [x] Query guests table and aggregate by guest_type
- [x] Display adults count from guests where guest_type = 'adult'
- [x] Display children count from guests where guest_type = 'child'
- [x] Display total (adults + children)
- [x] Show "No guests yet" when count is 0
- [x] Update counts when navigating back from Guests page

### US2: Accurate Vendor Count Display (P1) 🎯 MVP
- [x] Query vendors table for total count per wedding
- [x] Query vendor_payment_schedule for pending payments (status IN ('pending', 'overdue'))
- [x] Display total vendor count
- [x] Display pending payments count
- [x] Update counts when navigating back from Vendors page

### US3: Accurate Task Summary Display (P2)
- [x] Query pre_post_wedding_tasks table by status
- [x] Display task counts by status (pending, in_progress, completed)
- [x] Show empty state when no tasks exist
- [x] Filter to tasks for next 7 days by default

### US4: Currency Settings (P2)
- [x] Create Settings page with currency dropdown
- [x] Support ZAR, USD, EUR, GBP currencies
- [x] Save preference to users.preferences JSONB
- [x] Apply currency formatting to dashboard monetary values
- [x] Default to ZAR when no preference set

### US5: Timezone Settings (P3)
- [x] Add timezone dropdown to Settings page
- [x] Save preference to users.preferences JSONB
- [ ] Apply timezone to date/time displays (future enhancement)
- [x] Default to browser timezone when no preference set

### US6: Settings Page Navigation (P2)
- [x] Add "Settings" item to navigation drawer
- [x] Create /settings route
- [x] Pre-populate form with current preferences
- [x] Show success toast on save
- [x] Show error toast on failure

## Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-001 | Dashboard queries guests table and aggregates by guest_type | [x] |
| FR-002 | Dashboard queries vendors table for total count | [x] |
| FR-003 | Dashboard queries vendor_payment_schedule for pending payments | [x] |
| FR-004 | Dashboard queries pre_post_wedding_tasks for task counts | [x] |
| FR-005 | Currency preference persisted in users.preferences | [x] |
| FR-006 | Timezone preference persisted in users.preferences | [x] |
| FR-007 | All monetary values formatted with selected currency | [x] Dashboard only (future: all components) |
| FR-008 | Settings page accessible at /settings | [x] |
| FR-009 | Default currency is ZAR (R) | [x] |
| FR-010 | Default timezone is browser local | [x] |

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-001 | Guest counts match database within 1 second | [x] |
| SC-002 | Vendor counts match database accurately | [x] |
| SC-003 | Task counts match database accurately | [x] |
| SC-004 | Currency formatting consistent across dashboard | [x] |
| SC-005 | Settings persist across sessions | [x] |
| SC-006 | Settings page loads within 2 seconds | [x] |
| SC-007 | 100% monetary values use selected currency | [ ] Dashboard only - future enhancement for all components |
| SC-008 | No hardcoded values in stats | [x] |

## Technical Validation

- [x] TypeScript strict mode passes
- [x] Production build completes successfully
- [x] TanStack Query caches invalidate correctly
- [x] No console errors on Settings or Dashboard pages (verified via Playwright MCP)

## Files to Create/Modify

### New Files
- [x] src/pages/SettingsPage.tsx
- [x] src/hooks/useUserPreferences.ts
- [x] src/hooks/useVendorStats.ts
- [x] src/hooks/useTaskStats.ts
- [x] src/lib/currency.ts
- [x] src/types/settings.ts
- [x] src/contexts/CurrencyContext.tsx

### Files to Modify
- [x] src/components/dashboard/DashboardStatsGrid.tsx (fix guest counts, add vendor/task data)
- [x] src/hooks/useDashboard.ts (add vendor and task queries)
- [x] src/hooks/useGuestStats.ts (fix to query by guest_type)
- [x] src/lib/navigation.ts (set Settings isPlaceholder: false)
- [x] src/App.tsx (add /settings route, integrate CurrencyProvider)
- [x] src/pages/WeddingDashboardPage.tsx (pass vendorStats and taskStats to components)
- [x] src/components/dashboard/DashboardQuickActions.tsx (replace toast placeholders with navigation)

## Test Scenarios (Manual via Playwright MCP)

1. [x] Dashboard shows correct guest counts from database
2. [x] Dashboard shows correct vendor count
3. [x] Dashboard shows correct pending payments count
4. [x] Settings page loads and displays form
5. [x] Currency preference saves successfully
6. [x] Currency symbol changes on dashboard after preference change
7. [x] Settings persist after page refresh
8. [x] Empty state displays correctly when no guests/vendors/tasks
