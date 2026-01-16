/**
 * useWeddingItems Hook - TanStack Query hook for wedding items list
 * @feature 013-wedding-items
 * @task T004
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';

// =============================================================================
// Query Key Factory
// =============================================================================

export const weddingItemKeys = {
  all: ['wedding-items'] as const,
  lists: () => [...weddingItemKeys.all, 'list'] as const,
  list: (weddingId: string) => [...weddingItemKeys.lists(), weddingId] as const,
  details: () => [...weddingItemKeys.all, 'detail'] as const,
  detail: (itemId: string) => [...weddingItemKeys.details(), itemId] as const,
};

// =============================================================================
// Fetch All Wedding Items
// =============================================================================

interface UseWeddingItemsParams {
  weddingId: string;
}

interface UseWeddingItemsReturn {
  items: WeddingItemWithQuantities[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchWeddingItems(weddingId: string): Promise<WeddingItemWithQuantities[]> {
  const { data, error } = await supabase
    .from('wedding_items')
    .select(`
      *,
      event_quantities:wedding_item_event_quantities(
        *,
        event:events(id, event_name, event_date)
      )
    `)
    .eq('wedding_id', weddingId)
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching wedding items:', error);
    throw error;
  }

  return (data || []) as WeddingItemWithQuantities[];
}

/**
 * Hook to fetch all wedding items for a wedding with event quantities
 */
export function useWeddingItems({ weddingId }: UseWeddingItemsParams): UseWeddingItemsReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: weddingItemKeys.list(weddingId),
    queryFn: () => fetchWeddingItems(weddingId),
    enabled: !!weddingId,
  });

  return {
    items: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Helper Hook: Events for Quantities Table
// =============================================================================

interface EventOption {
  id: string;
  event_name: string;
  event_date: string;
}

/**
 * Hook to fetch events for the event quantities table
 */
export function useEventsForItems(weddingId: string) {
  return useQuery({
    queryKey: ['events', weddingId, 'for-items'],
    queryFn: async (): Promise<EventOption[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('id, event_name, event_date')
        .eq('wedding_id', weddingId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!weddingId,
  });
}
