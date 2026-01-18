# Requirements Checklist: Dashboard Data Settings Fix

**Feature**: 020-dashboard-settings-fix
**Created**: 2026-01-18

## User Stories

### US1: Accurate Guest Count Display (P1) 🎯 MVP
- [ ] Query guests table and aggregate by guest_type
- [ ] Display adults count from guests where guest_type = 'adult'
- [ ] Display children count from guests where guest_type = 'child'
- [ ] Display total (adults + children)
- [ ] Show "No guests yet" when count is 0
- [ ] Update counts when navigating back from Guests page

### US2: Accurate Vendor Count Display (P1) 🎯 MVP
- [ ] Query vendors table for total count per wedding
- [ ] Query vendor_payment_schedule for pending payments (status IN ('pending', 'overdue'))
- [ ] Display total vendor count
- [ ] Display pending payments count
- [ ] Update counts when navigating back from Vendors page

### US3: Accurate Task Summary Display (P2)
- [ ] Query pre_post_wedding_tasks table by status
- [ ] Display task counts by status (pending, in_progress, completed)
- [ ] Show empty state when no tasks exist
- [ ] Filter to tasks for next 7 days by default

### US4: Currency Settings (P2)
- [ ] Create Settings page with currency dropdown
- [ ] Support ZAR, USD, EUR, GBP currencies
- [ ] Save preference to users.preferences JSONB
- [ ] Apply currency formatting to all monetary values
- [ ] Default to ZAR when no preference set

### US5: Timezone Settings (P3)
- [ ] Add timezone dropdown to Settings page
- [ ] Save preference to users.preferences JSONB
- [ ] Apply timezone to date/time displays
- [ ] Default to browser timezone when no preference set

### US6: Settings Page Navigation (P2)
- [ ] Add "Settings" item to navigation drawer
- [ ] Create /settings route
- [ ] Pre-populate form with current preferences
- [ ] Show success toast on save
- [ ] Show error toast on failure

## Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-001 | Dashboard queries guests table and aggregates by guest_type | [ ] |
| FR-002 | Dashboard queries vendors table for total count | [ ] |
| FR-003 | Dashboard queries vendor_payment_schedule for pending payments | [ ] |
| FR-004 | Dashboard queries pre_post_wedding_tasks for task counts | [ ] |
| FR-005 | Currency preference persisted in users.preferences | [ ] |
| FR-006 | Timezone preference persisted in users.preferences | [ ] |
| FR-007 | All monetary values formatted with selected currency | [ ] |
| FR-008 | Settings page accessible at /settings | [ ] |
| FR-009 | Default currency is ZAR (R) | [ ] |
| FR-010 | Default timezone is browser local | [ ] |

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-001 | Guest counts match database within 1 second | [ ] |
| SC-002 | Vendor counts match database accurately | [ ] |
| SC-003 | Task counts match database accurately | [ ] |
| SC-004 | Currency formatting consistent across dashboard | [ ] |
| SC-005 | Settings persist across sessions | [ ] |
| SC-006 | Settings page loads within 2 seconds | [ ] |
| SC-007 | 100% monetary values use selected currency | [ ] |
| SC-008 | No hardcoded values in stats | [ ] |

## Technical Validation

- [ ] TypeScript strict mode passes
- [ ] Production build completes successfully
- [ ] TanStack Query caches invalidate correctly
- [ ] No console errors on Settings or Dashboard pages

## Files to Create/Modify

### New Files
- [ ] src/pages/SettingsPage.tsx
- [ ] src/hooks/useUserPreferences.ts
- [ ] src/hooks/useVendorStats.ts
- [ ] src/hooks/useTaskStats.ts
- [ ] src/lib/currency.ts
- [ ] src/types/settings.ts

### Files to Modify
- [ ] src/components/dashboard/DashboardStatsGrid.tsx (fix guest counts, add vendor/task data)
- [ ] src/hooks/useDashboard.ts (add vendor and task queries)
- [ ] src/hooks/useGuestStats.ts (fix to query by guest_type)
- [ ] src/components/layout/NavigationDrawer.tsx (add Settings link)
- [ ] src/App.tsx or router config (add /settings route)

## Test Scenarios (Manual via Playwright MCP)

1. [ ] Dashboard shows correct guest counts from database
2. [ ] Dashboard shows correct vendor count
3. [ ] Dashboard shows correct pending payments count
4. [ ] Settings page loads and displays form
5. [ ] Currency preference saves successfully
6. [ ] Currency symbol changes on dashboard after preference change
7. [ ] Settings persist after page refresh
8. [ ] Empty state displays correctly when no guests/vendors/tasks
