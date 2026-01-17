# Supabase Query Contracts: Notifications System

**Feature**: 018-notifications
**Date**: 2026-01-17

---

## CRITICAL: Database Field Names

**ALL queries MUST use snake_case field names exactly as shown below.**

| TypeScript | Database (use this) | WRONG |
|------------|---------------------|-------|
| `userId` | `user_id` | userId |
| `weddingId` | `wedding_id` | weddingId |
| `notificationType` | `notification_type` | notificationType, type |
| `entityType` | `entity_type` | entityType |
| `entityId` | `entity_id` | entityId |
| `actionUrl` | `action_url` | actionUrl |
| `actionLabel` | `action_label` | actionLabel |
| `isRead` | `is_read` | isRead, read |
| `readAt` | `read_at` | readAt |
| `createdAt` | `created_at` | createdAt |
| `updatedAt` | `updated_at` | updatedAt |

---

## Hook: useUnreadCount

**File**: `src/hooks/useUnreadCount.ts`

### Purpose

Fetch the count of unread notifications for the current user.

### Query Contract

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useUnreadCount() {
  const { user } = useAuth();

  const { data: count, isLoading, error } = useQuery({
    queryKey: ['notifications', 'unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)    // ⚠️ snake_case
        .eq('is_read', false);     // ⚠️ snake_case

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,        // Poll every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 15000,              // Consider stale after 15 seconds
  });

  return {
    count: count ?? 0,
    isLoading,
    error,
  };
}
```

### Return Type

```typescript
interface UseUnreadCountReturn {
  count: number;
  isLoading: boolean;
  error: Error | null;
}
```

---

## Hook: useNotifications

**File**: `src/hooks/useNotifications.ts`

### Purpose

Fetch notifications with optional filtering and pagination.

### Query Contract

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { NotificationRow, NotificationType, NotificationPriority } from '@/types/notification';

interface UseNotificationsOptions {
  limit?: number;
  offset?: number;
  typeFilter?: NotificationType | 'all';
  priorityFilter?: NotificationPriority | 'all';
  statusFilter?: 'all' | 'read' | 'unread';
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user } = useAuth();
  const {
    limit = 10,
    offset = 0,
    typeFilter = 'all',
    priorityFilter = 'all',
    statusFilter = 'all',
  } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', 'list', user?.id, limit, offset, typeFilter, priorityFilter, statusFilter],
    queryFn: async () => {
      if (!user?.id) return { notifications: [], totalCount: 0 };

      // Build query
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)                    // ⚠️ snake_case
        .order('created_at', { ascending: false }); // ⚠️ snake_case

      // Apply type filter
      if (typeFilter !== 'all') {
        query = query.eq('notification_type', typeFilter);  // ⚠️ snake_case
      }

      // Apply priority filter
      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      // Apply status filter
      if (statusFilter === 'read') {
        query = query.eq('is_read', true);   // ⚠️ snake_case
      } else if (statusFilter === 'unread') {
        query = query.eq('is_read', false);  // ⚠️ snake_case
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        notifications: data as NotificationRow[],
        totalCount: count || 0,
      };
    },
    enabled: !!user?.id,
  });

  return {
    notifications: data?.notifications ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error,
  };
}
```

### Return Type

```typescript
interface UseNotificationsReturn {
  notifications: NotificationRow[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}
```

---

## Hook: useNotificationMutations

**File**: `src/hooks/useNotificationMutations.ts`

### Purpose

Mutations for marking notifications as read and deleting notifications.

### Query Contract

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /**
   * Mark a single notification as read
   */
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,                           // ⚠️ snake_case
          read_at: new Date().toISOString(),       // ⚠️ snake_case
        })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    },
  });

  /**
   * Mark all unread notifications as read for current user
   */
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,                           // ⚠️ snake_case
          read_at: new Date().toISOString(),       // ⚠️ snake_case
        })
        .eq('user_id', user.id)                    // ⚠️ snake_case
        .eq('is_read', false);                     // ⚠️ snake_case

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all notifications as read');
    },
  });

  /**
   * Delete a notification
   */
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    },
  });

  /**
   * Create sample notifications (development only)
   */
  const createSampleNotifications = useMutation({
    mutationFn: async (weddingId: string | null) => {
      if (!user?.id) throw new Error('User not authenticated');

      const sampleNotifications = [
        {
          user_id: user.id,                        // ⚠️ snake_case
          wedding_id: weddingId,                   // ⚠️ snake_case
          notification_type: 'payment_due',        // ⚠️ snake_case
          title: 'Payment Due Soon',
          message: 'Caterer - Second payment ($5,000) due in 7 days',
          entity_type: 'vendor',                   // ⚠️ snake_case
          action_url: '/vendors',                  // ⚠️ snake_case
          action_label: 'View Vendors',            // ⚠️ snake_case
          priority: 'normal',
          is_read: false,                          // ⚠️ snake_case
        },
        {
          user_id: user.id,
          wedding_id: weddingId,
          notification_type: 'task_overdue',
          title: 'Task Overdue',
          message: 'Confirm floral delivery is overdue',
          entity_type: 'task',
          action_url: '/tasks',
          action_label: 'View Tasks',
          priority: 'urgent',
          is_read: false,
        },
        {
          user_id: user.id,
          wedding_id: weddingId,
          notification_type: 'rsvp_deadline',
          title: 'RSVP Deadline Today',
          message: '15 guests haven\'t responded yet',
          entity_type: 'guest',
          action_url: '/guests',
          action_label: 'View Guests',
          priority: 'high',
          is_read: false,
        },
        {
          user_id: user.id,
          wedding_id: weddingId,
          notification_type: 'vendor_update',
          title: 'Contract Expiring Soon',
          message: 'Photographer contract expires in 25 days',
          entity_type: 'vendor',
          action_url: '/vendors',
          action_label: 'View Vendors',
          priority: 'normal',
          is_read: true,
        },
        {
          user_id: user.id,
          wedding_id: weddingId,
          notification_type: 'budget_warning',
          title: 'Budget Exceeded',
          message: 'Flowers category is over budget by $800',
          entity_type: 'budget_category',
          action_url: '/budget',
          action_label: 'View Budget',
          priority: 'high',
          is_read: false,
        },
      ];

      const { error } = await supabase
        .from('notifications')
        .insert(sampleNotifications);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Sample notifications created!');
    },
    onError: (error) => {
      console.error('Error creating sample notifications:', error);
      toast.error('Failed to create sample notifications');
    },
  });

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createSampleNotifications,
  };
}
```

### Return Type

```typescript
interface UseNotificationMutationsReturn {
  markAsRead: UseMutationResult<void, Error, string>;
  markAllAsRead: UseMutationResult<void, Error, void>;
  deleteNotification: UseMutationResult<void, Error, string>;
  createSampleNotifications: UseMutationResult<void, Error, string | null>;
}
```

---

## Query Key Structure

All notification queries use this key structure for cache management:

```typescript
// Unread count
['notifications', 'unread-count', userId]

// Notification list (with all filter params)
['notifications', 'list', userId, limit, offset, typeFilter, priorityFilter, statusFilter]

// Invalidation (all notification queries)
queryClient.invalidateQueries({ queryKey: ['notifications'] });
```

---

## Error Handling Pattern

All queries follow the standard VowSync error handling pattern:

```typescript
try {
  const { data, error } = await supabase
    .from('notifications')
    .select('*');

  if (error) throw error;
  return data;
} catch (error) {
  console.error('Error message:', error);
  toast.error('User-friendly error message');
  throw error; // Re-throw for React Query error state
}
```

---

## RLS Policy Requirements

The `notifications` table has RLS enabled with these policies:

```sql
-- SELECT: Users can only view their own notifications
USING (auth.uid() = user_id)

-- UPDATE: Users can only update their own notifications
USING (auth.uid() = user_id)

-- DELETE: Users can only delete their own notifications
USING (auth.uid() = user_id)

-- INSERT: Users can only create notifications for themselves
WITH CHECK (auth.uid() = user_id)
```

All queries rely on these policies for data isolation. The `user_id` filter in queries is redundant but recommended for:
1. Query optimization (helps PostgreSQL query planner)
2. Defense in depth
3. Clear intent in code

---

## Performance Considerations

### Indexes Used

```sql
-- These indexes exist on the notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### Query Optimization

1. **Unread count**: Uses `head: true` to avoid fetching data, only count
2. **Pagination**: Uses `range()` for offset-based pagination
3. **Polling**: 30-second interval with 15-second stale time
4. **Window focus**: Refetch on focus for freshness

### Expected Response Times

| Query | Expected Time | Max Acceptable |
|-------|---------------|----------------|
| Unread count | < 50ms | 200ms |
| Recent (10) | < 100ms | 300ms |
| Paginated (20) | < 150ms | 500ms |
