# Component Contracts: Dashboard Data Settings Fix

**Feature**: 020-dashboard-settings-fix
**Date**: 2026-01-18

---

## 1. DashboardStatsGrid (Modified)

### Location
`src/components/dashboard/DashboardStatsGrid.tsx`

### Props Interface (Updated)
```typescript
interface DashboardStatsGridProps {
  metrics: DashboardMetrics | null;
  events: Event[];
  isLoading: boolean;
  // NEW: Additional stats for accurate display
  vendorStats?: VendorStats | null;
  taskStats?: TaskStats | null;
}
```

### Changes Required
1. Accept vendorStats and taskStats props
2. Use metrics.adultsCount and metrics.childrenCount for guest card
3. Use vendorStats for vendor card display
4. Use useCurrency() hook for budget formatting
5. Remove hardcoded values

### Card Display Logic

#### Guest Count Card
```typescript
// Before (hardcoded)
adultsCount = 0;
childrenCount = 0;

// After (from metrics)
const adultsCount = metrics?.adultsCount ?? 0;
const childrenCount = metrics?.childrenCount ?? 0;
const totalGuests = adultsCount + childrenCount;
```

#### Budget Card
```typescript
// Before (hardcoded symbol)
<p>${budgetTotal.toLocaleString()}</p>

// After (using context)
const { formatCurrency } = useCurrency();
<p>{formatCurrency(budgetTotal)}</p>
```

#### Vendors Card
```typescript
// Before (hardcoded)
<p>Total: 0</p>
<p>Pending Payments: 0</p>

// After (from vendorStats)
const vendorTotal = vendorStats?.total ?? 0;
const pendingPayments = vendorStats?.pendingPayments ?? 0;
<p>Total: {vendorTotal}</p>
<p>Pending Payments: {pendingPayments}</p>
```

---

## 2. SettingsPage (New)

### Location
`src/pages/SettingsPage.tsx`

### Component Structure
```typescript
export function SettingsPage(): JSX.Element
```

### Dependencies
- React Hook Form
- Zod validation
- Shadcn/ui Select, Button, Card
- useUserPreferences hook
- Sonner toast

### Form Schema
```typescript
const settingsSchema = z.object({
  currency: z.enum(['ZAR', 'USD', 'EUR', 'GBP']),
  timezone: z.string().min(1),
});
```

### Behavior
1. Load current preferences on mount
2. Pre-populate form with current values
3. Validate on submit
4. Update preferences via mutation
5. Show success/error toast
6. Redirect or stay on page after save

### Layout Structure
```tsx
<div className="container mx-auto px-4 py-6">
  <header>
    <h1>Settings</h1>
    <p>Manage your application preferences</p>
  </header>

  <Card>
    <CardHeader>
      <CardTitle>Preferences</CardTitle>
    </CardHeader>
    <CardContent>
      <Form>
        <FormField name="currency">
          <Select options={CURRENCIES} />
        </FormField>
        <FormField name="timezone">
          <Select options={TIMEZONES} />
        </FormField>
        <Button type="submit">Save Changes</Button>
      </Form>
    </CardContent>
  </Card>
</div>
```

---

## 3. CurrencyProvider (New)

### Location
`src/contexts/CurrencyContext.tsx`

### Component Structure
```typescript
export function CurrencyProvider({ children }: { children: React.ReactNode }): JSX.Element
```

### Context Value
```typescript
interface CurrencyContextType {
  currency: CurrencyCode;
  timezone: string;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}
```

### Integration Point
```tsx
// App.tsx
<AuthProvider>
  <CurrencyProvider>
    <RouterProvider router={router} />
  </CurrencyProvider>
</AuthProvider>
```

### Memoization
```typescript
const value = useMemo(() => ({
  currency: preferences?.currency ?? 'ZAR',
  timezone: preferences?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  formatCurrency: (amount: number) => formatCurrency(amount, currency),
  isLoading,
}), [preferences, isLoading]);
```

---

## 4. WeddingDashboardPage (Modified)

### Location
`src/pages/WeddingDashboardPage.tsx`

### Changes Required
1. Pass vendorStats and taskStats to DashboardStatsGrid
2. Update Upcoming Tasks section with real data

### Updated Props Passing
```typescript
// Before
<DashboardStatsGrid
  metrics={metrics}
  events={events}
  isLoading={isLoading}
/>

// After
<DashboardStatsGrid
  metrics={metrics}
  events={events}
  isLoading={isLoading}
  vendorStats={vendorStats}
  taskStats={taskStats}
/>
```

### Task Section Update
```typescript
// Before (placeholder)
<PlaceholderSection
  title="Upcoming Tasks (Next 7 Days)"
  message="Task management coming in Phase 12"
/>

// After (real data)
{taskStats?.upcomingTasks.length > 0 ? (
  <UpcomingTasksList tasks={taskStats.upcomingTasks} />
) : (
  <EmptyState message="No upcoming tasks" />
)}
```

---

## 5. DashboardQuickActions (Modified)

### Location
`src/components/dashboard/DashboardQuickActions.tsx`

### Changes Required
1. Replace toast placeholders with actual navigation
2. Use navigate() for all action buttons

### Action Configuration
```typescript
const quickActions = [
  {
    id: 'add-guest',
    label: 'Add Guest',
    icon: 'UserPlus',
    action: () => navigate(`/weddings/${weddingId}/guests/new`)
  },
  {
    id: 'add-vendor',
    label: 'Add Vendor',
    icon: 'Building2',
    action: () => navigate(`/weddings/${weddingId}/vendors/new`)
  },
  {
    id: 'create-event',
    label: 'Create Event',
    icon: 'CalendarPlus',
    action: () => navigate(`/weddings/${weddingId}/events/new`)
  },
  {
    id: 'view-timeline',
    label: 'View Timeline',
    icon: 'Calendar',
    action: () => navigate(`/weddings/${weddingId}/events`)
  },
  {
    id: 'manage-budget',
    label: 'Manage Budget',
    icon: 'DollarSign',
    action: () => navigate(`/weddings/${weddingId}/budget`)
  },
  {
    id: 'view-tasks',
    label: 'View Tasks',
    icon: 'CheckSquare',
    action: () => navigate(`/weddings/${weddingId}/tasks`)
  },
];
```

---

## Component Dependency Tree

```
App.tsx
├── AuthProvider
│   └── CurrencyProvider (NEW)
│       └── RouterProvider
│           ├── AppLayout
│           │   ├── AppSidebar
│           │   │   └── bottomNavItems → Settings link
│           │   └── Routes
│           │       ├── WeddingDashboardPage
│           │       │   ├── DashboardStatsGrid (uses useCurrency)
│           │       │   ├── UpcomingTasksList (NEW/enhanced)
│           │       │   └── DashboardQuickActions
│           │       └── SettingsPage (NEW)
│           └── ...other routes
```

---

## Accessibility Requirements

### SettingsPage
- Form labels associated with inputs
- Focus management on page load
- Error announcements for screen readers
- Keyboard navigation for Select components

### DashboardStatsGrid
- ARIA labels for stat cards
- Announce loading states
- Meaningful alt text for icons
