/**
 * Hook to fetch task statistics for dashboard display
 * @feature 020-dashboard-settings-fix
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TaskStats, TaskSummary } from '@/types/dashboard';

/**
 * Fetches task statistics for a wedding
 * - Upcoming tasks count (next 7 days, not completed/cancelled)
 * - Top 3 upcoming tasks for display
 */
export function useTaskStats(weddingId: string) {
  return useQuery({
    queryKey: ['taskStats', weddingId],
    queryFn: async (): Promise<TaskStats> => {
      // Calculate date range: today to 7 days from now
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];

      // Debug: Log date range
      console.log('Task query - Today:', todayStr);
      console.log('Task query - Seven days later:', sevenDaysLaterStr);
      console.log('Task query - Wedding ID:', weddingId);

      // Query tasks for next 7 days, excluding completed and cancelled
      const { data: tasks, count, error } = await supabase
        .from('pre_post_wedding_tasks')
        .select('id, title, due_date, status, priority', { count: 'exact' })
        .eq('wedding_id', weddingId)
        .gte('due_date', todayStr)
        .lte('due_date', sevenDaysLaterStr)
        .not('status', 'in', '("completed","cancelled")')
        .order('due_date', { ascending: true })
        .limit(3);

      if (error) {
        console.error('Task query error:', error);
        throw error;
      }

      // Debug: Log fetched tasks
      console.log('Task query - Fetched tasks:', tasks);
      console.log('Task query - Count:', count);

      return {
        upcoming: count ?? 0,
        upcomingTasks: (tasks as TaskSummary[]) ?? [],
      };
    },
    enabled: !!weddingId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
