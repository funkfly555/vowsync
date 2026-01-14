import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ActivityItem } from '@/types/dashboard';

/**
 * Hook to fetch recent activity log entries for a wedding
 * @param weddingId Wedding UUID
 * @param limit Maximum number of activities to fetch (default: 5)
 */
export function useRecentActivity(weddingId: string, limit: number = 5) {
  return useQuery({
    queryKey: ['recentActivity', weddingId, limit],
    queryFn: async (): Promise<ActivityItem[]> => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('id, action_type, entity_type, description, created_at')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Map snake_case database fields to camelCase TypeScript interface
      return (data ?? []).map((item) => ({
        id: item.id,
        actionType: item.action_type,
        entityType: item.entity_type,
        description: item.description,
        createdAt: item.created_at,
      }));
    },
    enabled: !!weddingId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
