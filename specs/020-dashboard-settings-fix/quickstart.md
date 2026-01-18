# Quickstart Guide: Dashboard Data Settings Fix

**Feature**: 020-dashboard-settings-fix
**Date**: 2026-01-18

---

## Overview

This feature fixes the dashboard to display accurate real-time data from the database and implements a Settings page with currency/timezone preferences.

---

## Implementation Order

### Phase 1: Foundation (Types & Utilities)
1. Create `src/types/settings.ts` - User preferences types
2. Create `src/lib/currency.ts` - Currency configuration and formatting
3. Extend `src/types/dashboard.ts` - Add VendorStats, TaskStats, enhanced GuestStats

### Phase 2: Data Layer (Hooks)
4. Enhance `src/hooks/useGuestStats.ts` - Add adults/children counts
5. Create `src/hooks/useVendorStats.ts` - Vendor and payment stats
6. Create `src/hooks/useTaskStats.ts` - Upcoming tasks stats
7. Create `src/hooks/useUserPreferences.ts` - User preferences CRUD
8. Enhance `src/hooks/useDashboard.ts` - Integrate new stats hooks

### Phase 3: Context Layer
9. Create `src/contexts/CurrencyContext.tsx` - Currency provider and hook
10. Integrate CurrencyProvider in `src/App.tsx`

### Phase 4: UI Layer
11. Modify `src/components/dashboard/DashboardStatsGrid.tsx` - Wire real data
12. Modify `src/components/dashboard/DashboardQuickActions.tsx` - Real navigation
13. Modify `src/pages/WeddingDashboardPage.tsx` - Pass new props, update tasks section

### Phase 5: Settings
14. Create `src/pages/SettingsPage.tsx` - Settings form
15. Add route in `src/App.tsx`
16. Update `src/lib/navigation.ts` - Enable Settings link

### Phase 6: Currency Integration
17. Audit and update all hardcoded currency displays

---

## Quick Reference

### Key Files to Create
```
src/types/settings.ts
src/lib/currency.ts
src/hooks/useVendorStats.ts
src/hooks/useTaskStats.ts
src/hooks/useUserPreferences.ts
src/contexts/CurrencyContext.tsx
src/pages/SettingsPage.tsx
```

### Key Files to Modify
```
src/types/dashboard.ts
src/hooks/useGuestStats.ts
src/hooks/useDashboard.ts
src/components/dashboard/DashboardStatsGrid.tsx
src/components/dashboard/DashboardQuickActions.tsx
src/pages/WeddingDashboardPage.tsx
src/lib/navigation.ts
src/App.tsx
```

### Database Tables (Existing - No Migrations)
```
guests           - guest_type field for adult/child counts
vendors          - vendor count per wedding
vendor_payment_schedule - payment status for pending counts
pre_post_wedding_tasks - upcoming tasks
users            - preferences JSONB column
```

---

## Code Snippets

### 1. Currency Formatting
```typescript
// src/lib/currency.ts
export const CURRENCIES = {
  ZAR: { symbol: 'R', locale: 'en-ZA', name: 'South African Rand' },
  USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
} as const;

export function formatCurrency(amount: number, code: CurrencyCode): string {
  const config = CURRENCIES[code] || CURRENCIES.ZAR;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: code,
  }).format(amount);
}
```

### 2. Guest Type Queries
```typescript
// Add to useGuestStats.ts Promise.all
supabase
  .from('guests')
  .select('*', { count: 'exact', head: true })
  .eq('wedding_id', weddingId)
  .or('guest_type.eq.adult,guest_type.is.null'),

supabase
  .from('guests')
  .select('*', { count: 'exact', head: true })
  .eq('wedding_id', weddingId)
  .eq('guest_type', 'child'),
```

### 3. Vendor Stats Query
```typescript
// src/hooks/useVendorStats.ts
const { count: vendorCount } = await supabase
  .from('vendors')
  .select('*', { count: 'exact', head: true })
  .eq('wedding_id', weddingId);

// Get vendor IDs, then query payments
const { count: pendingCount } = await supabase
  .from('vendor_payment_schedule')
  .select('*', { count: 'exact', head: true })
  .in('vendor_id', vendorIds)
  .in('status', ['pending', 'overdue']);
```

### 4. Task Stats Query
```typescript
// src/hooks/useTaskStats.ts
const today = new Date().toISOString().split('T')[0];
const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  .toISOString().split('T')[0];

const { data, count } = await supabase
  .from('pre_post_wedding_tasks')
  .select('id, title, due_date, status, priority', { count: 'exact' })
  .eq('wedding_id', weddingId)
  .gte('due_date', today)
  .lte('due_date', sevenDays)
  .not('status', 'in', '(completed,cancelled)')
  .order('due_date', { ascending: true })
  .limit(3);
```

### 5. User Preferences
```typescript
// Read
const { data } = await supabase
  .from('users')
  .select('preferences')
  .eq('id', userId)
  .single();

// Update
await supabase
  .from('users')
  .update({
    preferences: { ...current, currency: 'USD' }
  })
  .eq('id', userId);
```

### 6. Currency Context Usage
```typescript
// In any component
const { formatCurrency, currency } = useCurrency();
<p>{formatCurrency(budgetTotal)}</p>
```

---

## Testing Checklist

### Manual Tests
- [ ] Dashboard shows correct guest counts (adults + children)
- [ ] Dashboard shows correct vendor count
- [ ] Dashboard shows correct pending payments count
- [ ] Settings page loads with current preferences
- [ ] Currency change persists and updates displays
- [ ] Quick Actions navigate to correct pages
- [ ] No hardcoded values in stats cards

### Build Validation
```bash
npm run typecheck
npm run build
```

---

## Common Patterns

### Following Existing Patterns
- **Hooks**: Use same pattern as useGuestStats for new stat hooks
- **Context**: Follow AuthContext pattern for CurrencyContext
- **Forms**: Use React Hook Form + Zod like existing form pages
- **UI**: Use Shadcn/ui Select for dropdowns

### Query Keys
```typescript
['guestStats', weddingId]
['vendorStats', weddingId]
['taskStats', weddingId]
['userPreferences', userId]
```

### Stale Times
All stat hooks use 30-second stale time for consistency.

---

## Troubleshooting

### Issue: Guest counts showing 0
- Check that weddingId is being passed correctly
- Verify guests table has data for the wedding
- Check guest_type values are 'adult' or 'child'

### Issue: Currency not updating
- Ensure CurrencyProvider wraps the app
- Check that useUserPreferences mutation invalidates cache
- Verify users.preferences is being updated in database

### Issue: Settings not persisting
- Check Supabase RLS policies on users table
- Verify user is authenticated
- Check browser console for mutation errors
