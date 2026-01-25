/**
 * useRepurposingInstructions Hook - TanStack Query hook for repurposing instructions list
 * @feature 014-repurposing-timeline
 * @task T005
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RepurposingInstructionWithRelations } from '@/types/repurposing';

// =============================================================================
// Query Key Factory
// =============================================================================

export const repurposingKeys = {
  all: ['repurposing-instructions'] as const,
  lists: () => [...repurposingKeys.all, 'list'] as const,
  list: (weddingId: string) => [...repurposingKeys.lists(), weddingId] as const,
  details: () => [...repurposingKeys.all, 'detail'] as const,
  detail: (id: string) => [...repurposingKeys.details(), id] as const,
  itemsWithInstructions: (weddingId: string) =>
    [...repurposingKeys.all, 'items-with-instructions', weddingId] as const,
};

// =============================================================================
// Fetch All Repurposing Instructions
// =============================================================================

interface UseRepurposingInstructionsParams {
  weddingId: string;
}

interface UseRepurposingInstructionsReturn {
  instructions: RepurposingInstructionWithRelations[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch all repurposing instructions for a wedding with relations
 * Uses aliased joins for from_event and to_event (same table, different FKs)
 */
async function fetchRepurposingInstructions(
  weddingId: string
): Promise<RepurposingInstructionWithRelations[]> {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .select(`
      *,
      wedding_items!wedding_item_id(id, description, category),
      from_event:events!from_event_id(id, event_name, event_date, event_end_time),
      to_event:events!to_event_id(id, event_name, event_date, event_start_time),
      vendors!responsible_vendor_id(id, company_name)
    `)
    .eq('wedding_id', weddingId)
    .order('pickup_time', { ascending: true });

  if (error) {
    console.error('Error fetching repurposing instructions:', error);
    throw error;
  }

  return (data || []) as RepurposingInstructionWithRelations[];
}

/**
 * Hook to fetch all repurposing instructions for a wedding
 */
export function useRepurposingInstructions({
  weddingId,
}: UseRepurposingInstructionsParams): UseRepurposingInstructionsReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: repurposingKeys.list(weddingId),
    queryFn: () => fetchRepurposingInstructions(weddingId),
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    instructions: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Helper Hooks: Dropdown Data
// =============================================================================

interface ItemOption {
  id: string;
  description: string;
  category: string;
}

/**
 * Hook to fetch wedding items for dropdown selection
 */
export function useWeddingItemsForDropdown(weddingId: string) {
  return useQuery({
    queryKey: ['wedding-items', weddingId, 'for-dropdown'],
    queryFn: async (): Promise<ItemOption[]> => {
      const { data, error } = await supabase
        .from('wedding_items')
        .select('id, description, category')
        .eq('wedding_id', weddingId)
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface EventOption {
  id: string;
  event_name: string;
  event_date: string;
  event_start_time: string | null;
  event_end_time: string | null;
}

/**
 * Hook to fetch events for dropdown selection (includes times for validation)
 */
export function useEventsForDropdown(weddingId: string) {
  return useQuery({
    queryKey: ['events', weddingId, 'for-dropdown'],
    queryFn: async (): Promise<EventOption[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('id, event_name, event_date, event_start_time, event_end_time')
        .eq('wedding_id', weddingId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface VendorOption {
  id: string;
  company_name: string;
}

/**
 * Hook to fetch vendors for optional dropdown selection
 */
export function useVendorsForDropdown(weddingId: string) {
  return useQuery({
    queryKey: ['vendors', weddingId, 'for-dropdown'],
    queryFn: async (): Promise<VendorOption[]> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('wedding_id', weddingId)
        .order('company_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// =============================================================================
// Helper: Items with Instructions
// =============================================================================

/**
 * Hook to get list of item IDs that have repurposing instructions
 * Used to show indicator on wedding items list
 */
export function useItemsWithInstructions(weddingId: string) {
  return useQuery({
    queryKey: repurposingKeys.itemsWithInstructions(weddingId),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('repurposing_instructions')
        .select('wedding_item_id')
        .eq('wedding_id', weddingId);

      if (error) throw error;

      // Return unique item IDs
      return [...new Set(data?.map((d) => d.wedding_item_id) || [])];
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
