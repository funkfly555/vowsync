/**
 * useNotifications Hook - Fetch notifications list with filtering
 * @feature 018-notifications
 * @task T004
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { NotificationRow, NotificationType, NotificationPriority } from '@/types/notification';

// =============================================================================
// Hook Options
// =============================================================================

interface UseNotificationsOptions {
  /** Maximum number of notifications to fetch (default: 10) */
  limit?: number;
  /** Offset for pagination (default: 0) */
  offset?: number;
  /** Filter by notification type */
  typeFilter?: NotificationType | 'all';
  /** Filter by priority */
  priorityFilter?: NotificationPriority | 'all';
  /** Filter by read/unread status */
  statusFilter?: 'all' | 'read' | 'unread';
}

// =============================================================================
// Hook Return Type
// =============================================================================

interface UseNotificationsReturn {
  notifications: NotificationRow[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchNotifications(
  userId: string,
  options: UseNotificationsOptions
): Promise<{ notifications: NotificationRow[]; totalCount: number }> {
  const {
    limit = 10,
    offset = 0,
    typeFilter = 'all',
    priorityFilter = 'all',
    statusFilter = 'all',
  } = options;

  // Build query - CRITICAL: Use snake_case field names
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)                      // snake_case
    .order('created_at', { ascending: false }); // snake_case

  // Apply type filter
  if (typeFilter !== 'all') {
    query = query.eq('notification_type', typeFilter);  // snake_case
  }

  // Apply priority filter
  if (priorityFilter !== 'all') {
    query = query.eq('priority', priorityFilter);
  }

  // Apply status filter
  if (statusFilter === 'read') {
    query = query.eq('is_read', true);   // snake_case
  } else if (statusFilter === 'unread') {
    query = query.eq('is_read', false);  // snake_case
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return {
    notifications: (data as NotificationRow[]) || [],
    totalCount: count || 0,
  };
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to fetch notifications with optional filtering and pagination
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
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
    queryFn: () => fetchNotifications(user!.id, options),
    enabled: !!user?.id,
  });

  return {
    notifications: data?.notifications ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error: error as Error | null,
  };
}
