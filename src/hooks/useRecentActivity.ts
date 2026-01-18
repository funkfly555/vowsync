/**
 * Hook to fetch recent activity from activity_log for dashboard display
 * @feature 020-dashboard-settings-fix - Updated to use activity_log table
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ActivityItem } from '@/types/dashboard';

/**
 * Fetches recent activity log entries for a wedding to display on dashboard
 * Includes user full_name and role via join with users table
 * @param weddingId Wedding UUID
 * @param limit Maximum number of entries to fetch (default: 5)
 */
export function useRecentActivity(weddingId: string, limit: number = 5) {
  return useQuery({
    queryKey: ['recentActivity', weddingId, limit],
    queryFn: async (): Promise<ActivityItem[]> => {
      // Fetch from activity_log table with user join
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          id,
          action_type,
          entity_type,
          description,
          created_at,
          users:user_id (
            full_name,
            role
          )
        `)
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activity log:', error);
        throw error;
      }

      // Map activity_log fields to ActivityItem interface
      return (data ?? []).map((item) => {
        // Handle the joined user data (Supabase returns single object for single FK join)
        const user = item.users as unknown as { full_name: string; role: string } | null;

        return {
          id: item.id,
          actionType: item.action_type,
          entityType: item.entity_type,
          description: item.description,
          createdAt: item.created_at,
          userFullName: user?.full_name ?? undefined,
          userRole: (user?.role as 'consultant' | 'admin' | 'viewer') ?? undefined,
        };
      });
    },
    enabled: !!weddingId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
