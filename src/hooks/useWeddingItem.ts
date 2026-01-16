/**
 * useWeddingItem Hook - TanStack Query hook for single wedding item with quantities
 * @feature 013-wedding-items
 * @task T005
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { weddingItemKeys } from './useWeddingItems';

// =============================================================================
// Fetch Single Wedding Item
// =============================================================================

interface UseWeddingItemReturn {
  item: WeddingItemWithQuantities | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchWeddingItem(itemId: string): Promise<WeddingItemWithQuantities | null> {
  const { data, error } = await supabase
    .from('wedding_items')
    .select(`
      *,
      event_quantities:wedding_item_event_quantities(
        *,
        event:events(id, event_name, event_date)
      )
    `)
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching wedding item:', error);
    throw error;
  }

  return data as WeddingItemWithQuantities | null;
}

/**
 * Hook to fetch a single wedding item by ID with all event quantities
 */
export function useWeddingItem(itemId: string | undefined): UseWeddingItemReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: weddingItemKeys.detail(itemId!),
    queryFn: () => fetchWeddingItem(itemId!),
    enabled: !!itemId,
  });

  return {
    item: data || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
