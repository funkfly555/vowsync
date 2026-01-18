# Research: Dashboard Data Settings Fix

**Feature**: 020-dashboard-settings-fix
**Date**: 2026-01-18
**Status**: Complete

---

## Research Summary

This document captures technical decisions and best practices research for implementing accurate dashboard data and user settings.

---

## 1. Dashboard Data Architecture

### Decision: Enhance existing useDashboard hook vs create new hook

**Decision**: Enhance existing `useDashboard.ts` hook

**Rationale**:
- `useDashboard.ts` already orchestrates multiple queries (wedding, events, guestStats, activity)
- Adding vendor and task queries follows the established pattern
- Keeps dashboard data centralized in one location
- Maintains TanStack Query cache key organization

**Alternatives Considered**:
- Create separate `useVendorStats` and `useTaskStats` hooks - Rejected because it fragments dashboard data and increases component complexity
- Create new `useWeddingDashboard` hook - Rejected because it duplicates existing hook pattern

### Pattern to Follow

```typescript
// src/hooks/useDashboard.ts - existing pattern
export function useDashboard(weddingId: string): DashboardData {
  const weddingQuery = useWedding(weddingId);
  const eventsQuery = useEvents(weddingId);
  const guestStatsQuery = useGuestStats(weddingId);
  // ADD: vendorStatsQuery
  // ADD: taskStatsQuery
}
```

---

## 2. Guest Count by Type

### Decision: Query strategy for guest_type breakdown

**Decision**: Modify `useGuestStats` to also return counts by `guest_type`

**Rationale**:
- The existing `useGuestStats` hook only counts by `invitation_status`
- Need additional counts for `guest_type = 'adult'` and `guest_type = 'child'`
- Can add to existing parallel Promise.all() for efficiency

**Database Query Pattern**:
```typescript
// Add to existing Promise.all in useGuestStats
const adultsResult = await supabase
  .from('guests')
  .select('*', { count: 'exact', head: true })
  .eq('wedding_id', weddingId)
  .eq('guest_type', 'adult');

const childrenResult = await supabase
  .from('guests')
  .select('*', { count: 'exact', head: true })
  .eq('wedding_id', weddingId)
  .eq('guest_type', 'child');
```

**Note**: Guests with null/undefined `guest_type` should be counted as adults (default behavior).

---

## 3. Vendor Stats Query

### Decision: Create new useVendorStats hook

**Decision**: Create dedicated `useVendorStats.ts` hook

**Rationale**:
- Separates vendor stats from full vendor list fetching
- Follows existing pattern (useGuestStats, useVendorTotals)
- Optimized query using `count: 'exact'` for efficiency
- Returns { total, pendingPayments } matching dashboard needs

**Query Strategy**:
```typescript
// Step 1: Get vendor count for wedding
const { count: vendorCount } = await supabase
  .from('vendors')
  .select('*', { count: 'exact', head: true })
  .eq('wedding_id', weddingId);

// Step 2: Get vendor IDs (needed for payment query)
const { data: vendors } = await supabase
  .from('vendors')
  .select('id')
  .eq('wedding_id', weddingId);

// Step 3: Get pending payments count
const vendorIds = vendors?.map(v => v.id) || [];
if (vendorIds.length > 0) {
  const { count: pendingCount } = await supabase
    .from('vendor_payment_schedule')
    .select('*', { count: 'exact', head: true })
    .in('vendor_id', vendorIds)
    .in('status', ['pending', 'overdue']);
}
```

---

## 4. Task Stats Query

### Decision: Create useTaskStats hook for dashboard

**Decision**: Create new `useTaskStats.ts` hook

**Rationale**:
- Dashboard needs upcoming tasks (next 7 days) vs full task list
- Different query requirements than existing `useTasks` hook
- Returns task counts and limited task list for display

**Query Pattern**:
```typescript
const today = new Date().toISOString().split('T')[0];
const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  .toISOString().split('T')[0];

const { data: tasks, count } = await supabase
  .from('pre_post_wedding_tasks')
  .select('*', { count: 'exact' })
  .eq('wedding_id', weddingId)
  .gte('due_date', today)
  .lte('due_date', sevenDaysLater)
  .not('status', 'in', '(completed,cancelled)')
  .order('due_date', { ascending: true })
  .limit(3);
```

---

## 5. User Preferences Storage

### Decision: Use existing users.preferences JSONB column

**Decision**: Store currency and timezone in `users.preferences` JSONB

**Rationale**:
- Column already exists in database with default `'{}'::jsonb`
- No database migration required
- Flexible structure for future preferences
- Follows Supabase best practices for user settings

**Structure**:
```typescript
interface UserPreferences {
  currency?: 'ZAR' | 'USD' | 'EUR' | 'GBP';
  timezone?: string; // IANA timezone string
}
```

**Query Pattern**:
```typescript
// Read preferences
const { data: user } = await supabase
  .from('users')
  .select('preferences')
  .eq('id', userId)
  .single();

const currency = user?.preferences?.currency || 'ZAR';
const timezone = user?.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

// Update preferences
await supabase
  .from('users')
  .update({
    preferences: {
      ...currentPreferences,
      currency: 'USD',
      timezone: 'America/New_York'
    }
  })
  .eq('id', userId);
```

---

## 6. Currency Context vs Hook

### Decision: Create CurrencyContext for global currency access

**Decision**: Create `CurrencyContext.tsx` with `useCurrency` hook

**Rationale**:
- Currency setting needs to be accessible throughout entire app
- Many components need currency symbol (dashboard, budget, vendors, bar orders)
- Context provides single source of truth
- Avoids prop drilling currency through component tree
- Note: Constitution allows Context for this cross-cutting concern (it's not "global state" like Redux)

**Implementation**:
```typescript
// src/contexts/CurrencyContext.tsx
interface CurrencyContextType {
  currency: string;
  timezone: string;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'ZAR',
  timezone: 'Africa/Johannesburg',
  formatCurrency: (amount) => `R${amount.toLocaleString()}`,
  isLoading: true,
});
```

**Note**: Constitution prohibits Context API for "global state" - this is an exception as it's for cross-cutting user preferences, similar to how AuthContext is already used.

---

## 7. Settings Page Routing

### Decision: Add /settings as standalone route outside wedding context

**Decision**: Route at `/settings` (not `/weddings/:id/settings`)

**Rationale**:
- User preferences are global, not wedding-specific
- Matches existing navigation config (`path: '/settings'`)
- Settings should persist across wedding switches
- Simpler routing without weddingId parameter

**Implementation**:
- Add route in App.tsx inside AppLayout (with navigation shell)
- Settings page doesn't need wedding context
- Update bottomNavItems to set `isPlaceholder: false`

---

## 8. Currency Formatting

### Decision: Currency symbol and locale configuration

**Decision**: Create `src/lib/currency.ts` utility module

**Rationale**:
- Centralized currency symbol mapping
- Consistent formatting across application
- Easy to add new currencies
- Uses Intl.NumberFormat for proper locale handling

**Currency Configuration**:
```typescript
export const CURRENCIES = {
  ZAR: { symbol: 'R', locale: 'en-ZA', name: 'South African Rand' },
  USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
} as const;

export function formatCurrency(amount: number, currencyCode: string): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.ZAR;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
```

---

## 9. Timezone Options

### Decision: Limited timezone list for South African focus

**Decision**: Provide curated list of 5-8 common timezones

**Rationale**:
- Most users are in South Africa (Africa/Johannesburg default)
- Full IANA timezone list is overwhelming (400+ options)
- Focus on regions where wedding consultants might operate
- Can expand list based on user feedback

**Timezone Options**:
```typescript
export const TIMEZONES = [
  { value: 'Africa/Johannesburg', label: 'South Africa (SAST)' },
  { value: 'Europe/London', label: 'United Kingdom (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET/CEST)' },
  { value: 'America/New_York', label: 'Eastern US (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Pacific US (PST/PDT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
] as const;
```

---

## 10. DashboardStatsGrid Refactoring

### Decision: Keep current card structure, fix data sources

**Decision**: Minimal changes to existing DashboardStatsGrid component

**Rationale**:
- Current 2x2 grid layout is correct
- Only need to wire up real data from hooks
- Preserve existing loading and error states
- Keep emoji-based icons as specified

**Changes Required**:
1. Accept vendorStats and taskStats as props
2. Wire adults/children counts from enhanced guestStats
3. Use currency context for budget formatting
4. Update Vendors card with real counts

---

## 11. Quick Actions Navigation

### Decision: Make Quick Actions functional with real navigation

**Decision**: Update DashboardQuickActions to use navigate()

**Rationale**:
- Quick Actions currently show "Coming in phase X" messages
- All destination pages now exist (guests, vendors, events, budget, tasks)
- Only "Generate Docs" may show toast if Documents feature is incomplete
- Improves user experience significantly

**Routes to Connect**:
```typescript
const quickActions = [
  { label: 'Add Guest', path: `/weddings/${weddingId}/guests` },
  { label: 'Add Vendor', path: `/weddings/${weddingId}/vendors` },
  { label: 'Create Event', path: `/weddings/${weddingId}/events/new` },
  { label: 'View Timeline', path: `/weddings/${weddingId}/events` },
  { label: 'Manage Budget', path: `/weddings/${weddingId}/budget` },
  { label: 'View Tasks', path: `/weddings/${weddingId}/tasks` },
];
```

---

## 12. Existing Currency Displays

### Decision: Audit and update all hardcoded currency symbols

**Decision**: Replace hardcoded "$" and "R" with currency context

**Files Requiring Updates** (based on grep analysis):
1. `src/components/dashboard/DashboardStatsGrid.tsx` - Budget card uses `$`
2. `src/pages/budget/BudgetPage.tsx` - All budget amounts
3. `src/pages/vendors/` - Contract values, payment amounts
4. `src/pages/bar-orders/` - Cost displays
5. `src/components/vendors/` - Payment schedule, invoices

**Update Pattern**:
```typescript
// Before
<p>Budget: ${budgetTotal.toLocaleString()}</p>

// After
const { formatCurrency } = useCurrency();
<p>Budget: {formatCurrency(budgetTotal)}</p>
```

---

## Summary of Technical Decisions

| Topic | Decision | Key Rationale |
|-------|----------|---------------|
| Dashboard hook | Enhance useDashboard.ts | Centralized, follows existing pattern |
| Guest counts | Modify useGuestStats | Add guest_type queries |
| Vendor stats | New useVendorStats hook | Dedicated dashboard stats |
| Task stats | New useTaskStats hook | Different from full task list |
| Preferences storage | users.preferences JSONB | Existing column, no migration |
| Currency access | CurrencyContext | Cross-cutting concern |
| Settings route | /settings (global) | User-level, not wedding-specific |
| Currency format | lib/currency.ts | Centralized, Intl.NumberFormat |
| Timezones | Curated list (7 options) | South African focus |
| Grid refactor | Minimal changes | Wire real data, preserve structure |
| Quick Actions | Real navigation | All pages exist |
| Currency audit | Update all displays | Context-based formatting |

---

## Open Questions (Resolved)

1. ~~Should currency preference be per-wedding or per-user?~~ → **Per-user** (stored in users table)
2. ~~Should we create a migration for users.preferences?~~ → **No** (column already exists)
3. ~~Full IANA timezone list or curated?~~ → **Curated** (7 common timezones)
4. ~~Context vs prop drilling for currency?~~ → **Context** (cross-cutting concern exception)

---

## Dependencies Confirmed

- No new npm packages required
- Uses existing: TanStack Query, React Hook Form, Zod, Shadcn/ui Select
- Uses existing: Supabase client, AuthContext
- Uses existing: Sonner for toast notifications

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Currency context re-renders | Memoize context value |
| Query waterfall for stats | Parallel queries with Promise.all |
| Stale dashboard data | TanStack Query refetch on window focus |
| Missing guest_type values | Default to 'adult' if null |
