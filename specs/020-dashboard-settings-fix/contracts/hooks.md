# Hook Contracts: Dashboard Data Settings Fix

**Feature**: 020-dashboard-settings-fix
**Date**: 2026-01-18

---

## 1. useGuestStats (Enhanced)

### Location
`src/hooks/useGuestStats.ts`

### Interface
```typescript
export function useGuestStats(weddingId: string): UseQueryResult<GuestStats>
```

### Return Type (Enhanced)
```typescript
interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  responseRate: number;
  adults: number;    // NEW: Count of adult guests
  children: number;  // NEW: Count of child guests
}
```

### Query Key
```typescript
['guestStats', weddingId]
```

### Behavior
- Fetches all guest counts in parallel using Promise.all
- New queries for adults and children counts
- Adults: `guest_type = 'adult' OR guest_type IS NULL` (default)
- Children: `guest_type = 'child'`
- Enabled only when weddingId is truthy
- Stale time: 30 seconds

---

## 2. useVendorStats (New)

### Location
`src/hooks/useVendorStats.ts`

### Interface
```typescript
export function useVendorStats(weddingId: string): UseQueryResult<VendorStats>
```

### Return Type
```typescript
interface VendorStats {
  total: number;           // Total vendors for wedding
  pendingPayments: number; // Payments with status IN ('pending', 'overdue')
}
```

### Query Key
```typescript
['vendorStats', weddingId]
```

### Behavior
- Step 1: Count vendors for wedding
- Step 2: Get vendor IDs
- Step 3: Count pending/overdue payments across all vendor payment schedules
- Enabled only when weddingId is truthy
- Stale time: 30 seconds (matches other stats hooks)

---

## 3. useTaskStats (New)

### Location
`src/hooks/useTaskStats.ts`

### Interface
```typescript
export function useTaskStats(weddingId: string): UseQueryResult<TaskStats>
```

### Return Type
```typescript
interface TaskStats {
  upcoming: number;           // Count of tasks due in next 7 days
  upcomingTasks: TaskSummary[]; // Top 3 upcoming tasks
}

interface TaskSummary {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
}
```

### Query Key
```typescript
['taskStats', weddingId]
```

### Behavior
- Queries tasks for next 7 days
- Excludes completed and cancelled tasks
- Orders by due_date ascending
- Limits to 3 tasks for display
- Returns both count and task details
- Enabled only when weddingId is truthy
- Stale time: 30 seconds

---

## 4. useUserPreferences (New)

### Location
`src/hooks/useUserPreferences.ts`

### Interface
```typescript
export function useUserPreferences(): {
  preferences: UserPreferences;
  isLoading: boolean;
  isError: boolean;
  updatePreferences: UseMutationResult<void, Error, Partial<UserPreferences>>;
}
```

### Return Type
```typescript
interface UserPreferences {
  currency: CurrencyCode;  // Default: 'ZAR'
  timezone: string;        // Default: browser timezone
}
```

### Query Key
```typescript
['userPreferences', userId]
```

### Behavior
- Fetches user preferences from users.preferences JSONB column
- Provides defaults when preferences are empty or missing
- Mutation updates preferences with merge (preserves unspecified fields)
- Invalidates query cache on successful mutation
- Requires authenticated user (uses AuthContext)

---

## 5. useDashboard (Enhanced)

### Location
`src/hooks/useDashboard.ts`

### Interface (Unchanged)
```typescript
export function useDashboard(weddingId: string): DashboardData
```

### Return Type (Enhanced)
```typescript
interface DashboardData {
  // Existing
  wedding: Wedding | null;
  metrics: DashboardMetrics | null;
  events: Event[];
  guestStats: GuestStats | null;
  recentActivity: ActivityItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;

  // NEW
  vendorStats: VendorStats | null;
  taskStats: TaskStats | null;
}
```

### Changes Required
1. Import and call useVendorStats
2. Import and call useTaskStats
3. Include vendorStats and taskStats in loading/error aggregation
4. Update calculateMetrics to include new counts
5. Add vendorStats and taskStats to refetch function

---

## 6. useCurrency (Context Hook)

### Location
`src/contexts/CurrencyContext.tsx`

### Interface
```typescript
export function useCurrency(): CurrencyContextType

interface CurrencyContextType {
  currency: CurrencyCode;
  timezone: string;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}
```

### Behavior
- Returns current currency and timezone from context
- formatCurrency function uses Intl.NumberFormat
- isLoading reflects preference fetch state
- Must be used within CurrencyProvider

### Provider Requirements
- Wrap app in CurrencyProvider (inside AuthProvider)
- Provider fetches preferences on mount
- Updates context when preferences change

---

## Hook Dependencies

```
useDashboard
├── useWedding
├── useEvents
├── useGuestStats (enhanced)
├── useRecentActivity
├── useVendorStats (new)
└── useTaskStats (new)

CurrencyProvider
└── useUserPreferences (new)
    └── AuthContext (userId)

SettingsPage
└── useUserPreferences (new)
```

---

## Cache Invalidation

| Action | Invalidate Keys |
|--------|-----------------|
| Add/Edit/Delete Guest | `['guestStats', weddingId]` |
| Add/Edit/Delete Vendor | `['vendorStats', weddingId]` |
| Update Payment Status | `['vendorStats', weddingId]` |
| Add/Edit/Delete Task | `['taskStats', weddingId]` |
| Update Preferences | `['userPreferences', userId]` |
