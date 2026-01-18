# Data Model: Dashboard Data Settings Fix

**Feature**: 020-dashboard-settings-fix
**Date**: 2026-01-18
**Status**: Complete

---

## Overview

This document defines the data structures and type extensions required for accurate dashboard data display and user settings functionality.

---

## 1. User Preferences (Existing JSONB Column)

### Storage Location
```sql
-- users.preferences column (already exists)
-- Type: JSONB with default '{}'::jsonb
```

### TypeScript Interface
```typescript
// src/types/settings.ts

export type CurrencyCode = 'ZAR' | 'USD' | 'EUR' | 'GBP';

export interface UserPreferences {
  currency?: CurrencyCode;
  timezone?: string; // IANA timezone string
}

export interface UserSettings {
  id: string;
  email: string;
  preferences: UserPreferences;
}
```

### Default Values
| Field | Default Value | Rationale |
|-------|---------------|-----------|
| currency | 'ZAR' | Primary user base in South Africa |
| timezone | Browser local | Intl.DateTimeFormat().resolvedOptions().timeZone |

---

## 2. Enhanced Guest Stats

### Current GuestStats Interface
```typescript
// src/types/dashboard.ts (existing)
export interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  responseRate: number;
}
```

### Enhanced GuestStats Interface
```typescript
// src/types/dashboard.ts (extended)
export interface GuestStats {
  // Existing fields
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  responseRate: number;

  // New fields for guest type breakdown
  adults: number;      // guest_type = 'adult' OR guest_type IS NULL
  children: number;    // guest_type = 'child'
}
```

### Database Query Pattern
```typescript
// Additional queries for useGuestStats.ts
const [adultsResult, childrenResult] = await Promise.all([
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
]);
```

---

## 3. Vendor Stats

### New VendorStats Interface
```typescript
// src/types/dashboard.ts (new)
export interface VendorStats {
  total: number;           // Count of vendors for wedding
  pendingPayments: number; // Payments with status IN ('pending', 'overdue')
}
```

### Database Relationships
```
vendors (1) ---> (N) vendor_payment_schedule
  └── wedding_id        └── vendor_id
                        └── status: 'pending' | 'overdue' | 'paid' | 'cancelled'
```

### Database Query Pattern
```typescript
// src/hooks/useVendorStats.ts
async function fetchVendorStats(weddingId: string): Promise<VendorStats> {
  // Step 1: Count vendors
  const { count: vendorCount } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })
    .eq('wedding_id', weddingId);

  // Step 2: Get vendor IDs for payment query
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id')
    .eq('wedding_id', weddingId);

  // Step 3: Count pending payments
  const vendorIds = vendors?.map(v => v.id) || [];
  let pendingCount = 0;

  if (vendorIds.length > 0) {
    const { count } = await supabase
      .from('vendor_payment_schedule')
      .select('*', { count: 'exact', head: true })
      .in('vendor_id', vendorIds)
      .in('status', ['pending', 'overdue']);
    pendingCount = count ?? 0;
  }

  return {
    total: vendorCount ?? 0,
    pendingPayments: pendingCount,
  };
}
```

---

## 4. Task Stats

### New TaskStats Interface
```typescript
// src/types/dashboard.ts (new)
export interface TaskStats {
  upcoming: number;      // Tasks due in next 7 days (not completed/cancelled)
  upcomingTasks: Task[]; // Top 3 upcoming tasks for display
}

// Task type from existing pre_post_wedding_tasks table
export interface TaskSummary {
  id: string;
  title: string;
  due_date: string;
  status: TaskStatus;
  priority: TaskPriority;
}
```

### Database Query Pattern
```typescript
// src/hooks/useTaskStats.ts
async function fetchTaskStats(weddingId: string): Promise<TaskStats> {
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const { data: tasks, count } = await supabase
    .from('pre_post_wedding_tasks')
    .select('id, title, due_date, status, priority', { count: 'exact' })
    .eq('wedding_id', weddingId)
    .gte('due_date', today)
    .lte('due_date', sevenDaysLater)
    .not('status', 'in', '(completed,cancelled)')
    .order('due_date', { ascending: true })
    .limit(3);

  return {
    upcoming: count ?? 0,
    upcomingTasks: tasks ?? [],
  };
}
```

---

## 5. Currency Configuration

### Currency Config Type
```typescript
// src/lib/currency.ts

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  ZAR: { code: 'ZAR', symbol: 'R', locale: 'en-ZA', name: 'South African Rand' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
} as const;
```

### Formatting Function
```typescript
export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
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

## 6. Timezone Configuration

### Timezone Options Type
```typescript
// src/lib/currency.ts (or separate timezone.ts)

export interface TimezoneOption {
  value: string;  // IANA timezone string
  label: string;  // Display label
}

export const TIMEZONES: TimezoneOption[] = [
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

## 7. Enhanced Dashboard Data

### Updated DashboardData Interface
```typescript
// src/types/dashboard.ts (extended)
export interface DashboardData {
  // Existing fields
  wedding: Wedding | null;
  metrics: DashboardMetrics | null;
  events: Event[];
  guestStats: GuestStats | null;
  recentActivity: ActivityItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;

  // New fields
  vendorStats: VendorStats | null;
  taskStats: TaskStats | null;
}
```

### Updated DashboardMetrics Interface
```typescript
// src/types/dashboard.ts (extended)
export interface DashboardMetrics {
  // Existing fields
  daysUntilWedding: number;
  isWeddingPast: boolean;
  isWeddingToday: boolean;
  totalGuests: number;
  confirmedGuests: number;
  eventCount: number;
  budgetSpent: number;
  budgetTotal: number;
  budgetPercentage: number;

  // New fields
  adultsCount: number;
  childrenCount: number;
  vendorCount: number;
  pendingPaymentsCount: number;
  upcomingTasksCount: number;
}
```

---

## 8. Currency Context Type

### Context Interface
```typescript
// src/contexts/CurrencyContext.tsx

export interface CurrencyContextType {
  currency: CurrencyCode;
  timezone: string;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

// Default context value
const defaultContext: CurrencyContextType = {
  currency: 'ZAR',
  timezone: 'Africa/Johannesburg',
  formatCurrency: (amount) => formatCurrency(amount, 'ZAR'),
  isLoading: true,
};
```

---

## 9. Settings Form Schema

### Zod Schema
```typescript
// src/pages/SettingsPage.tsx

import { z } from 'zod';

export const settingsFormSchema = z.object({
  currency: z.enum(['ZAR', 'USD', 'EUR', 'GBP']),
  timezone: z.string().min(1, 'Timezone is required'),
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;
```

---

## 10. Database Field Reference

### guests table (existing)
| Field | Type | Usage |
|-------|------|-------|
| id | uuid | Primary key |
| wedding_id | uuid | Foreign key to weddings |
| guest_type | text | 'adult' \| 'child' \| 'vendor' \| 'staff' |
| invitation_status | text | 'pending' \| 'invited' \| 'confirmed' \| 'declined' |

### vendors table (existing)
| Field | Type | Usage |
|-------|------|-------|
| id | uuid | Primary key |
| wedding_id | uuid | Foreign key to weddings |

### vendor_payment_schedule table (existing)
| Field | Type | Usage |
|-------|------|-------|
| id | uuid | Primary key |
| vendor_id | uuid | Foreign key to vendors |
| status | text | 'pending' \| 'overdue' \| 'paid' \| 'cancelled' |

### pre_post_wedding_tasks table (existing)
| Field | Type | Usage |
|-------|------|-------|
| id | uuid | Primary key |
| wedding_id | uuid | Foreign key to weddings |
| title | text | Task title |
| due_date | date | Task due date |
| status | text | Task status |
| priority | text | Task priority |

### users table (existing)
| Field | Type | Usage |
|-------|------|-------|
| id | uuid | Primary key |
| email | text | User email |
| preferences | jsonb | { currency?: string, timezone?: string } |

---

## Summary

| Entity | Status | Changes Required |
|--------|--------|------------------|
| GuestStats | Extend | Add adults, children fields |
| VendorStats | New | Create interface and hook |
| TaskStats | New | Create interface and hook |
| UserPreferences | New | Create type definitions |
| CurrencyConfig | New | Create configuration object |
| DashboardData | Extend | Add vendorStats, taskStats |
| DashboardMetrics | Extend | Add derived counts |
| CurrencyContextType | New | Create context interface |
| SettingsFormData | New | Create Zod schema |

---

## No Database Migrations Required

All data is stored in existing tables:
- `guests.guest_type` - already exists
- `vendors` - already exists
- `vendor_payment_schedule.status` - already exists
- `pre_post_wedding_tasks` - already exists
- `users.preferences` - JSONB column already exists with default `'{}'::jsonb`
