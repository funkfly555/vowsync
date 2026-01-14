# API Contracts: Wedding Dashboard

**Feature Branch**: `004-wedding-dashboard`
**Created**: 2026-01-13
**Status**: Complete

## Overview

The Wedding Dashboard uses Supabase client queries (not REST API endpoints). This document defines the query contracts for each data fetch operation.

---

## Query Contracts

### Q1: Get Wedding by ID

**Hook**: `useWedding(weddingId: string)`
**Existing**: Yes (from useWeddings.ts)

```typescript
// Query
const { data, error } = await supabase
  .from('weddings')
  .select('*')
  .eq('id', weddingId)
  .single();

// Response Type
interface Wedding {
  id: string;
  consultant_id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string | null;
  // ... all wedding fields
  budget_total: number;
  budget_actual: number;
}
```

---

### Q2: Get Events for Wedding

**Hook**: `useEvents(weddingId: string)`
**Existing**: Yes (from useEvents.ts)

```typescript
// Query
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('wedding_id', weddingId)
  .order('event_date', { ascending: true })
  .order('event_start_time', { ascending: true })
  .order('event_order', { ascending: true });

// Response Type
interface Event[] // Array of Event objects
```

---

### Q3: Get Guest Statistics

**Hook**: `useGuestStats(weddingId: string)` (NEW)

```typescript
// Query - using Supabase aggregation
const { count: total } = await supabase
  .from('guests')
  .select('*', { count: 'exact', head: true })
  .eq('wedding_id', weddingId);

const { count: confirmed } = await supabase
  .from('guests')
  .select('*', { count: 'exact', head: true })
  .eq('wedding_id', weddingId)
  .eq('invitation_status', 'confirmed');

const { count: declined } = await supabase
  .from('guests')
  .select('*', { count: 'exact', head: true })
  .eq('wedding_id', weddingId)
  .eq('invitation_status', 'declined');

// Alternative: Single query with RPC function (if performance needed)
// const { data } = await supabase.rpc('get_guest_stats', { p_wedding_id: weddingId });

// Response Type
interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number; // calculated: total - confirmed - declined
  responseRate: number; // calculated: ((confirmed + declined) / total) * 100
}
```

---

### Q4: Get Recent Activity

**Hook**: `useRecentActivity(weddingId: string, limit?: number)` (NEW)

```typescript
// Query
const { data, error } = await supabase
  .from('activity_log')
  .select('id, action_type, entity_type, description, created_at')
  .eq('wedding_id', weddingId)
  .order('created_at', { ascending: false })
  .limit(limit ?? 5);

// Response Type
interface ActivityItem {
  id: string;
  action_type: string;
  entity_type: string;
  description: string;
  created_at: string;
}
```

---

## Component Props Contracts

### MetricCard

```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}
```

### MetricsGrid

```typescript
interface MetricsGridProps {
  metrics: DashboardMetrics;
  weddingDate: string;
  isLoading?: boolean;
}
```

### EventsSummary

```typescript
interface EventsSummaryProps {
  events: Event[];
  weddingId: string;
  maxItems?: number; // default: 5
  isLoading?: boolean;
}
```

### QuickActions

```typescript
interface QuickActionsProps {
  weddingId: string;
  actions?: QuickAction[]; // default actions if not provided
}
```

### RsvpProgress

```typescript
interface RsvpProgressProps {
  stats: GuestStats;
  weddingId: string;
  isLoading?: boolean;
}
```

### ActivityFeed

```typescript
interface ActivityFeedProps {
  activities: ActivityItem[];
  weddingId: string;
  maxItems?: number; // default: 5
  isLoading?: boolean;
}
```

### DashboardSkeleton

```typescript
interface DashboardSkeletonProps {
  // No props - renders full skeleton layout
}
```

---

## Hook Return Contracts

### useDashboard

```typescript
interface UseDashboardReturn {
  // Data
  wedding: Wedding | null;
  metrics: DashboardMetrics | null;
  events: Event[];
  guestStats: GuestStats | null;
  recentActivity: ActivityItem[];

  // Status
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  refetch: () => void;
}

function useDashboard(weddingId: string): UseDashboardReturn;
```

### useGuestStats

```typescript
interface UseGuestStatsReturn {
  data: GuestStats | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

function useGuestStats(weddingId: string): UseGuestStatsReturn;
```

### useRecentActivity

```typescript
interface UseRecentActivityReturn {
  data: ActivityItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

function useRecentActivity(weddingId: string, limit?: number): UseRecentActivityReturn;
```

---

## Error Handling Contract

All queries follow the standard pattern from constitution:

```typescript
try {
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Error fetching data:', error);
  toast.error('Failed to load data. Please try again.');
  throw error;
}
```

---

## Route Contract

```typescript
// App.tsx route definition
<Route
  path="/weddings/:weddingId"
  element={<WeddingDashboardPage />}
/>

// Route params
interface WeddingDashboardParams {
  weddingId: string; // UUID
}
```

---

## Navigation Contracts

| From | To | Trigger |
|------|-----|---------|
| WeddingList | WeddingDashboard | Click wedding card |
| WeddingDashboard | EventTimeline | Click "View Timeline" or event |
| WeddingDashboard | CreateEvent | Click "Add Event" |
| WeddingDashboard | EditWedding | Click wedding title/settings |
| WeddingDashboard | GuestList | Click RSVP section (future) |
| WeddingDashboard | Budget | Click budget metric (future) |
