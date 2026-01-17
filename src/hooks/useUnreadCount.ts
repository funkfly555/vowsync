/**
 * useUnreadCount Hook - Fetch unread notification count
 * @feature 018-notifications
 * @task T003
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// =============================================================================
// Hook Return Type
// =============================================================================

interface UseUnreadCountReturn {
  count: number;
  isLoading: boolean;
  error: Error | null;
}

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchUnreadCount(userId: string): Promise<number> {
  // CRITICAL: Use snake_case field names
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)    // snake_case
    .eq('is_read', false);    // snake_case

  if (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }

  return count || 0;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to fetch unread notification count for the current user
 * Polls every 30 seconds for near-real-time updates
 */
export function useUnreadCount(): UseUnreadCountReturn {
  const { user } = useAuth();

  const { data: count, isLoading, error } = useQuery({
    queryKey: ['notifications', 'unread-count', user?.id],
    queryFn: () => fetchUnreadCount(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000,        // Poll every 30 seconds
    refetchOnWindowFocus: true,    // Refetch when window gains focus
    staleTime: 15000,              // Consider stale after 15 seconds
  });

  return {
    count: count ?? 0,
    isLoading,
    error: error as Error | null,
  };
}
