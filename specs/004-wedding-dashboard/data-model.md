# Data Model: Wedding Dashboard

**Feature Branch**: `004-wedding-dashboard`
**Created**: 2026-01-13
**Status**: Complete

## Overview

The Wedding Dashboard feature does **not** require new database tables or columns. It aggregates data from existing tables using client-side queries and calculations.

---

## Existing Entities Used

### 1. Wedding (Primary Entity)

**Table**: `weddings`
**Used For**: Core wedding info, countdown calculation, budget summary

| Field | Type | Usage in Dashboard |
|-------|------|-------------------|
| id | UUID | Primary key, route param |
| bride_name | text | Header display |
| groom_name | text | Header display |
| wedding_date | date | Days countdown calculation |
| venue_name | text | Header subtitle |
| budget_total | numeric | Budget metric card |
| budget_actual | numeric | Budget metric card (spent) |
| guest_count_adults | integer | Guest count fallback* |
| guest_count_children | integer | Guest count fallback* |
| status | text | Status badge display |

*Note: Guest counts from `weddings` table are legacy. Dashboard will prefer actual COUNT from `guests` table.

---

### 2. Event

**Table**: `events`
**Used For**: Events timeline summary, event count metric

| Field | Type | Usage in Dashboard |
|-------|------|-------------------|
| id | UUID | Navigation link |
| wedding_id | UUID | Filter condition |
| event_name | text | Display in summary |
| event_date | date | Display and sorting |
| event_start_time | time | Display in summary |
| event_end_time | time | Display in summary |
| event_location | text | Display in summary |
| event_type | text | Icon selection |

**Query**: `SELECT * FROM events WHERE wedding_id = ? ORDER BY event_date, event_start_time LIMIT 5`

---

### 3. Guest

**Table**: `guests`
**Used For**: Guest count metric, RSVP progress

| Field | Type | Usage in Dashboard |
|-------|------|-------------------|
| id | UUID | Count aggregation |
| wedding_id | UUID | Filter condition |
| invitation_status | text | RSVP breakdown (pending/invited/confirmed/declined) |
| attendance_confirmed | boolean | Confirmed count |

**Aggregation Query**:
```sql
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE invitation_status = 'confirmed') as confirmed,
  COUNT(*) FILTER (WHERE invitation_status = 'declined') as declined,
  COUNT(*) FILTER (WHERE invitation_status IN ('pending', 'invited')) as pending
FROM guests
WHERE wedding_id = ?
```

---

### 4. Activity Log

**Table**: `activity_log`
**Used For**: Recent activity feed

| Field | Type | Usage in Dashboard |
|-------|------|-------------------|
| id | UUID | List key |
| wedding_id | UUID | Filter condition |
| action_type | text | Icon selection |
| entity_type | text | Icon and label |
| description | text | Activity text |
| created_at | timestamptz | Relative timestamp |

**Query**: `SELECT * FROM activity_log WHERE wedding_id = ? ORDER BY created_at DESC LIMIT 5`

---

## New TypeScript Types

### Dashboard Types (src/types/dashboard.ts)

```typescript
// Dashboard metric data
export interface DashboardMetrics {
  daysUntilWedding: number;
  isWeddingPast: boolean;
  isWeddingToday: boolean;
  totalGuests: number;
  confirmedGuests: number;
  eventCount: number;
  budgetSpent: number;
  budgetTotal: number;
  budgetPercentage: number;
}

// Guest statistics for RSVP progress
export interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  responseRate: number; // (confirmed + declined) / total * 100
}

// Activity log item
export interface ActivityItem {
  id: string;
  actionType: string;
  entityType: string;
  description: string;
  createdAt: string;
}

// Quick action definition
export interface QuickAction {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  href: string;
  disabled?: boolean;
  disabledReason?: string;
}

// Dashboard data aggregate (hook return type)
export interface DashboardData {
  wedding: Wedding | null;
  metrics: DashboardMetrics | null;
  events: Event[];
  guestStats: GuestStats | null;
  recentActivity: ActivityItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
```

---

## Data Relationships

```
Wedding (1) ──────┬───────── Events (N)
                  │
                  ├───────── Guests (N)
                  │
                  └───────── Activity Log (N)
```

All child tables are filtered by `wedding_id` with existing RLS policies.

---

## Calculated Fields

| Field | Calculation | Location |
|-------|-------------|----------|
| daysUntilWedding | `differenceInDays(wedding_date, today)` | Client (useDashboard) |
| isWeddingPast | `daysUntilWedding < 0` | Client |
| isWeddingToday | `daysUntilWedding === 0` | Client |
| budgetPercentage | `(budgetSpent / budgetTotal) * 100` | Client |
| responseRate | `((confirmed + declined) / total) * 100` | Client |
| eventDuration | `event_end_time - event_start_time` | Existing (events table) |

---

## State Transitions

### Wedding Status (existing)
```
planning → confirmed → completed
    │          │
    └──────────┴────→ cancelled
```

### Invitation Status (existing)
```
pending → invited → confirmed
              │
              └───→ declined
```

No new state machines introduced for dashboard feature.

---

## Validation Rules

No new validation rules for dashboard (read-only feature).

Existing validations apply:
- `wedding_date`: Valid date
- `invitation_status`: One of 'pending', 'invited', 'confirmed', 'declined'
- `action_type`: Matches activity_log constraints

---

## Performance Considerations

1. **Parallel Queries**: All dashboard queries run in parallel via React Query
2. **Limited Results**: Activity log limited to 5 items, events limited to 5 items
3. **Aggregation**: Guest stats use COUNT aggregation rather than fetching all rows
4. **Caching**: React Query caches results for 5 minutes by default
5. **Stale Time**: Dashboard data considered fresh for 30 seconds

---

## No Database Migrations Required

This feature is read-only and uses existing tables/columns. No schema changes needed.
