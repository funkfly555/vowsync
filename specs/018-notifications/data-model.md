# Data Model: Notifications System

**Feature**: 018-notifications
**Date**: 2026-01-17

---

## Entity Overview

This feature uses the **existing** `notifications` table created in Phase 1 (database schema foundation). No new tables or migrations are required.

---

## Primary Entity: Notification

### Table: `notifications`

**Status**: EXISTS (from Phase 1)
**RLS**: ENABLED (policies already configured)

### Schema Definition

```sql
-- EXISTING TABLE - DO NOT RECREATE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  action_url TEXT,
  action_label TEXT,
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (existing)
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_wedding_id ON notifications(wedding_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### Field Descriptions

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | NO | Primary key, auto-generated |
| `user_id` | UUID | NO | User who receives notification (FK to auth.users) |
| `wedding_id` | UUID | YES | Related wedding if applicable (FK to weddings) |
| `notification_type` | TEXT | NO | Type classification (see enum below) |
| `title` | TEXT | NO | Short notification headline |
| `message` | TEXT | NO | Detailed notification body |
| `entity_type` | TEXT | YES | Related entity type (vendor, guest, task, etc.) |
| `entity_id` | UUID | YES | ID of related entity for deep linking |
| `action_url` | TEXT | YES | URL to navigate when clicking notification |
| `action_label` | TEXT | YES | Button text (e.g., "View Payment") |
| `priority` | TEXT | NO | Priority level (low, normal, high, urgent) |
| `is_read` | BOOLEAN | NO | Whether notification has been read |
| `read_at` | TIMESTAMPTZ | YES | Timestamp when marked as read |
| `created_at` | TIMESTAMPTZ | NO | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | Last update timestamp |

### Enumerated Values

#### notification_type

| Value | Description | Icon | Color |
|-------|-------------|------|-------|
| `payment_due` | Payment approaching due date | DollarSign | red-500 |
| `payment_overdue` | Payment past due date | DollarSign | red-600 |
| `task_due` | Task approaching due date | CheckSquare | orange-500 |
| `task_overdue` | Task past due date | CheckSquare | orange-600 |
| `rsvp_deadline` | RSVP deadline approaching | Users | blue-500 |
| `rsvp_overdue` | RSVP deadline passed | Users | blue-600 |
| `vendor_update` | Vendor contract/insurance update | Briefcase | yellow-500 |
| `budget_warning` | Budget category exceeded | AlertTriangle | red-600 |

#### priority

| Value | Description | Border Color | Badge Style |
|-------|-------------|--------------|-------------|
| `urgent` | Immediate attention required | border-red-500 (#F44336) | Red background |
| `high` | Important, time-sensitive | border-orange-500 (#FF9800) | Orange background |
| `normal` | Standard notification | border-blue-500 (#2196F3) | Blue background |
| `low` | Informational only | border-gray-400 (#9E9E9E) | Gray background |

#### entity_type

| Value | Description | Action URL Pattern |
|-------|-------------|-------------------|
| `vendor` | Vendor entity | `/vendors/{entity_id}` |
| `guest` | Guest entity | `/guests/{entity_id}` |
| `task` | Task entity | `/tasks` |
| `payment` | Payment entity | `/vendors/{vendor_id}` |
| `budget_category` | Budget category | `/budget` |

---

## TypeScript Interfaces

### Database Types (snake_case)

```typescript
/**
 * Notification entity as stored in Supabase
 * CRITICAL: Use snake_case field names in all queries
 */
export interface NotificationRow {
  id: string;
  user_id: string;
  wedding_id: string | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  entity_type: EntityType | null;
  entity_id: string | null;
  action_url: string | null;
  action_label: string | null;
  priority: NotificationPriority;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'payment_due'
  | 'payment_overdue'
  | 'task_due'
  | 'task_overdue'
  | 'rsvp_deadline'
  | 'rsvp_overdue'
  | 'vendor_update'
  | 'budget_warning';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type EntityType = 'vendor' | 'guest' | 'task' | 'payment' | 'budget_category';
```

### Insert/Update Types

```typescript
/**
 * Type for creating a new notification
 */
export interface NotificationInsert {
  user_id: string;
  wedding_id?: string | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  entity_type?: EntityType | null;
  entity_id?: string | null;
  action_url?: string | null;
  action_label?: string | null;
  priority?: NotificationPriority;
  is_read?: boolean;
}

/**
 * Type for updating a notification (mark as read)
 */
export interface NotificationUpdate {
  is_read?: boolean;
  read_at?: string | null;
}
```

---

## Relationships

### Parent Entity: User (auth.users)

```
auth.users (1) ──────< (many) notifications
              user_id
```

- User has many notifications
- Notifications are cascade-deleted when user is deleted

### Optional Parent: Wedding (weddings)

```
weddings (1) ──────< (many) notifications
            wedding_id (nullable)
```

- Wedding has many notifications
- Notifications are cascade-deleted when wedding is deleted
- Notifications can exist without a wedding (user-level notifications)

### Reference Entity (Non-FK)

```
notifications.entity_id -----> any entity
notifications.entity_type     (vendor, guest, task, etc.)
```

- Loose coupling to related entities
- No foreign key constraint (allows flexibility)
- Used for deep linking to specific items

---

## RLS Policies (Existing)

```sql
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Users can create notifications for themselves
CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Query Patterns

### Fetch Unread Count

```typescript
const { count } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false);
```

### Fetch Recent Notifications (Dropdown)

```typescript
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);
```

### Fetch All Notifications with Filters (Full Page)

```typescript
let query = supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

if (typeFilter !== 'all') {
  query = query.eq('notification_type', typeFilter);
}

if (statusFilter === 'read') {
  query = query.eq('is_read', true);
} else if (statusFilter === 'unread') {
  query = query.eq('is_read', false);
}

if (priorityFilter !== 'all') {
  query = query.eq('priority', priorityFilter);
}

const { data } = await query.range(offset, offset + limit - 1);
```

### Mark as Read

```typescript
const { error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('id', notificationId);
```

### Mark All as Read

```typescript
const { error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('user_id', userId)
  .eq('is_read', false);
```

### Delete Notification

```typescript
const { error } = await supabase
  .from('notifications')
  .delete()
  .eq('id', notificationId);
```

### Create Notification (Testing)

```typescript
const { data, error } = await supabase
  .from('notifications')
  .insert({
    user_id: userId,
    wedding_id: weddingId,
    notification_type: 'payment_due',
    title: 'Payment Due Soon',
    message: 'Caterer payment due in 7 days',
    entity_type: 'vendor',
    entity_id: vendorId,
    action_url: `/vendors/${vendorId}`,
    action_label: 'View Vendor',
    priority: 'normal'
  })
  .select()
  .single();
```

---

## Validation Rules

### Required Fields

- `user_id`: Must be valid UUID, must match authenticated user
- `notification_type`: Must be one of defined enum values
- `title`: Non-empty string, max 200 characters
- `message`: Non-empty string, max 1000 characters
- `priority`: Must be one of: low, normal, high, urgent

### Optional Fields

- `wedding_id`: Valid UUID or null
- `entity_type`: Must be one of defined enum values or null
- `entity_id`: Valid UUID or null
- `action_url`: Valid relative URL path or null
- `action_label`: String (max 50 characters) or null

### Business Rules

1. `is_read` defaults to `false` on creation
2. `read_at` is set only when `is_read` changes to `true`
3. `created_at` and `updated_at` are auto-managed
4. Users can only access their own notifications (RLS enforced)

---

## Migration Notes

**NO MIGRATION REQUIRED** - The `notifications` table was created in Phase 1.

If schema changes are needed in future:
1. Create new migration file in `supabase/migrations/`
2. Use `supabase migration new <name>` to generate
3. Apply with `supabase db push`
