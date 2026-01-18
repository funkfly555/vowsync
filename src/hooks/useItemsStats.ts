/**
 * Hook to fetch wedding items statistics for dashboard display
 * @feature 020-dashboard-settings-fix
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ItemsStats {
  total: number;
  shortage: number;
  totalCost: number;
}

/**
 * Fetches wedding items statistics for a wedding
 * - Total Items: count of all items
 * - Items Short: count where total_required > number_available
 * - Total Cost: sum of all total_cost values
 */
export function useItemsStats(weddingId: string) {
  return useQuery({
    queryKey: ['items-stats', weddingId],
    queryFn: async (): Promise<ItemsStats> => {
      const { data, error } = await supabase
        .from('wedding_items')
        .select('total_required, number_available, total_cost')
        .eq('wedding_id', weddingId);

      if (error) throw error;

      const items = data ?? [];

      const shortage = items.filter(
        (i) => i.number_available != null && i.total_required > i.number_available
      ).length;

      const totalCost = items.reduce((sum, i) => sum + (i.total_cost || 0), 0);

      return {
        total: items.length,
        shortage,
        totalCost,
      };
    },
    enabled: !!weddingId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
