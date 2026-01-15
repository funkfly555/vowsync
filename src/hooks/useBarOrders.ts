/**
 * useBarOrders Hook - TanStack Query hook for bar order list
 * @feature 012-bar-order-management
 * @task T006
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BarOrderWithRelations } from '@/types/barOrder';

// =============================================================================
// Query Key Factory
// =============================================================================

export const barOrderKeys = {
  all: ['bar-orders'] as const,
  lists: () => [...barOrderKeys.all, 'list'] as const,
  list: (weddingId: string) => [...barOrderKeys.lists(), weddingId] as const,
  details: () => [...barOrderKeys.all, 'detail'] as const,
  detail: (orderId: string) => [...barOrderKeys.details(), orderId] as const,
};

// =============================================================================
// Fetch All Bar Orders
// =============================================================================

interface UseBarOrdersParams {
  weddingId: string;
}

interface UseBarOrdersReturn {
  barOrders: BarOrderWithRelations[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchBarOrders(weddingId: string): Promise<BarOrderWithRelations[]> {
  const { data, error } = await supabase
    .from('bar_orders')
    .select(`
      *,
      event:events(id, event_name, event_start_time, event_end_time, expected_guests_adults),
      vendor:vendors(id, company_name),
      items:bar_order_items(*)
    `)
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bar orders:', error);
    throw error;
  }

  // Transform data to match expected type interface
  return (data || []).map((order) => ({
    ...order,
    event: order.event
      ? {
          id: order.event.id,
          name: order.event.event_name,
          start_time: order.event.event_start_time,
          end_time: order.event.event_end_time,
        }
      : null,
    vendor: order.vendor
      ? {
          id: order.vendor.id,
          business_name: order.vendor.company_name,
        }
      : null,
  })) as BarOrderWithRelations[];
}

/**
 * Hook to fetch all bar orders for a wedding
 */
export function useBarOrders({ weddingId }: UseBarOrdersParams): UseBarOrdersReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: barOrderKeys.list(weddingId),
    queryFn: () => fetchBarOrders(weddingId),
    enabled: !!weddingId,
  });

  return {
    barOrders: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
