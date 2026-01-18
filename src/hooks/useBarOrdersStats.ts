/**
 * Hook to fetch bar orders statistics for dashboard display
 * @feature 020-dashboard-settings-fix
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface BarOrdersStats {
  total: number;
  draft: number;
  confirmed: number;
  delivered: number;
}

/**
 * Fetches bar orders statistics for a wedding
 * - Total Orders: count of all orders
 * - Draft: orders with status = 'draft'
 * - Confirmed: orders with status = 'confirmed'
 * - Delivered: orders with status = 'delivered'
 */
export function useBarOrdersStats(weddingId: string) {
  return useQuery({
    queryKey: ['bar-orders-stats', weddingId],
    queryFn: async (): Promise<BarOrdersStats> => {
      const { data, error } = await supabase
        .from('bar_orders')
        .select('status')
        .eq('wedding_id', weddingId);

      if (error) throw error;

      const orders = data ?? [];

      return {
        total: orders.length,
        draft: orders.filter((o) => o.status === 'draft').length,
        confirmed: orders.filter((o) => o.status === 'confirmed').length,
        delivered: orders.filter((o) => o.status === 'delivered').length,
      };
    },
    enabled: !!weddingId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
