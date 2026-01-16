/**
 * useRepurposingInstruction Hook - TanStack Query hook for single repurposing instruction
 * @feature 014-repurposing-timeline
 * @task T006
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RepurposingInstructionWithRelations } from '@/types/repurposing';
import { repurposingKeys } from './useRepurposingInstructions';

// =============================================================================
// Fetch Single Repurposing Instruction
// =============================================================================

interface UseRepurposingInstructionParams {
  instructionId: string;
  enabled?: boolean;
}

interface UseRepurposingInstructionReturn {
  instruction: RepurposingInstructionWithRelations | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch a single repurposing instruction by ID with relations
 * Uses aliased joins for from_event and to_event (same table, different FKs)
 */
async function fetchRepurposingInstruction(
  instructionId: string
): Promise<RepurposingInstructionWithRelations> {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .select(`
      *,
      wedding_items!wedding_item_id(id, description, category),
      from_event:events!from_event_id(id, event_name, event_date, event_end_time),
      to_event:events!to_event_id(id, event_name, event_date, event_start_time),
      vendors!responsible_vendor_id(id, company_name)
    `)
    .eq('id', instructionId)
    .single();

  if (error) {
    console.error('Error fetching repurposing instruction:', error);
    throw error;
  }

  return data as RepurposingInstructionWithRelations;
}

/**
 * Hook to fetch a single repurposing instruction by ID
 */
export function useRepurposingInstruction({
  instructionId,
  enabled = true,
}: UseRepurposingInstructionParams): UseRepurposingInstructionReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: repurposingKeys.detail(instructionId),
    queryFn: () => fetchRepurposingInstruction(instructionId),
    enabled: !!instructionId && enabled,
  });

  return {
    instruction: data || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
