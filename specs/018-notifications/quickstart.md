# Quickstart: Notifications System with Bell Icon

**Feature**: 018-notifications
**Date**: 2026-01-17

---

## 5-Minute Setup

### Prerequisites

- VowSync development environment running
- Supabase project configured
- Authenticated user session

### Database

**NO MIGRATION REQUIRED** - The `notifications` table already exists from Phase 1.

Verify table exists:
```sql
SELECT * FROM notifications LIMIT 1;
```

---

## Implementation Order

### Step 1: Types (5 min)

Create `src/types/notification.ts`:

```typescript
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
```

### Step 2: Hooks (15 min)

Create hooks in this order:

1. `src/hooks/useUnreadCount.ts` - Fetch unread count with polling
2. `src/hooks/useNotifications.ts` - Fetch notifications list with filters
3. `src/hooks/useNotificationMutations.ts` - Mark read, delete mutations

See `contracts/supabase-queries.md` for exact implementations.

### Step 3: Helper Functions (5 min)

Create `src/lib/notificationHelpers.ts`:

```typescript
import { format } from 'date-fns';

export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return format(then, 'MMM d, yyyy');
}

export function getPriorityBorderClass(priority: string): string {
  switch (priority) {
    case 'urgent': return 'border-l-4 border-red-500';
    case 'high': return 'border-l-4 border-orange-500';
    case 'normal': return 'border-l-4 border-blue-500';
    case 'low': return 'border-l-4 border-gray-400';
    default: return 'border-l-4 border-gray-400';
  }
}
```

### Step 4: Components (30 min)

Create components in this order:

1. `src/components/notifications/NotificationIcon.tsx` - Type-specific icons
2. `src/components/notifications/NotificationCard.tsx` - Individual card
3. `src/components/notifications/NotificationDropdown.tsx` - Dropdown panel
4. `src/components/notifications/NotificationBell.tsx` - Bell with badge
5. `src/components/notifications/NotificationFilters.tsx` - Filter controls
6. `src/components/notifications/CreateSampleNotifications.tsx` - Dev utility

See `contracts/component-props.md` for exact props interfaces.

### Step 5: Page (10 min)

Create `src/pages/NotificationsPage.tsx` with filters and pagination.

### Step 6: Integration (10 min)

1. Add `NotificationBell` to `NavigationShell.tsx` header
2. Add route `/notifications` to router configuration

---

## Quick Validation

### Manual Testing Checklist

1. [ ] Bell icon visible in header
2. [ ] Click bell opens dropdown
3. [ ] Click outside closes dropdown
4. [ ] Unread count badge shows correctly
5. [ ] "Mark All Read" clears unread count
6. [ ] Click notification navigates to action URL
7. [ ] Full page shows all filters working
8. [ ] Delete button removes notification
9. [ ] Dev button creates sample data (dev only)

### Create Test Data

In development, use the "Create Sample Notifications" button on `/notifications` page, or insert manually:

```sql
INSERT INTO notifications (
  user_id, wedding_id, notification_type, title, message,
  entity_type, action_url, action_label, priority, is_read
) VALUES (
  'YOUR_USER_ID', 'YOUR_WEDDING_ID', 'payment_due',
  'Payment Due Soon', 'Caterer payment due in 7 days',
  'vendor', '/vendors', 'View Vendors', 'normal', false
);
```

---

## Critical Reminders

### SNAKE_CASE Database Fields

**ALWAYS** use snake_case in Supabase queries:

```typescript
// ✅ CORRECT
.eq('user_id', userId)
.eq('is_read', false)
.eq('notification_type', 'payment_due')

// ❌ WRONG - These will fail silently!
.eq('userId', userId)
.eq('isRead', false)
.eq('notificationType', 'payment_due')
```

### Query Key Structure

```typescript
// Unread count
['notifications', 'unread-count', userId]

// List with filters
['notifications', 'list', userId, limit, offset, typeFilter, priorityFilter, statusFilter]

// Invalidate all
queryClient.invalidateQueries({ queryKey: ['notifications'] });
```

### Polling Configuration

```typescript
refetchInterval: 30000,  // 30 seconds
staleTime: 15000,        // 15 seconds
refetchOnWindowFocus: true,
```

---

## File Checklist

```
src/
├── types/
│   └── [ ] notification.ts
├── hooks/
│   ├── [ ] useUnreadCount.ts
│   ├── [ ] useNotifications.ts
│   └── [ ] useNotificationMutations.ts
├── components/
│   └── notifications/
│       ├── [ ] NotificationBell.tsx
│       ├── [ ] NotificationDropdown.tsx
│       ├── [ ] NotificationCard.tsx
│       ├── [ ] NotificationIcon.tsx
│       ├── [ ] NotificationFilters.tsx
│       └── [ ] CreateSampleNotifications.tsx
├── pages/
│   └── [ ] NotificationsPage.tsx
└── lib/
    └── [ ] notificationHelpers.ts
```

---

## Reference Documents

- [spec.md](./spec.md) - Feature specification
- [data-model.md](./data-model.md) - Database schema details
- [contracts/component-props.md](./contracts/component-props.md) - Component interfaces
- [contracts/supabase-queries.md](./contracts/supabase-queries.md) - Hook implementations
- [research.md](./research.md) - Design decisions

---

## Common Issues

### Badge Not Updating

- Check `refetchInterval` is set on `useUnreadCount`
- Verify `invalidateQueries` called after mutations
- Check RLS policies allow read access

### Notifications Not Showing

- Verify `user_id` matches authenticated user
- Check RLS policies on `notifications` table
- Ensure query uses snake_case field names

### Click Not Navigating

- Verify `action_url` is set on notification
- Check `onClick` handler calls navigation
- Ensure dropdown closes before navigation
