/**
 * useRepurposingMutations Hook - TanStack Query mutations for repurposing CRUD
 * @feature 014-repurposing-timeline
 * @task T007, T028
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { RepurposingInstruction } from '@/types/repurposing';
import { repurposingKeys } from './useRepurposingInstructions';

// =============================================================================
// Types
// =============================================================================

type CreateInstructionData = Omit<
  RepurposingInstruction,
  'id' | 'created_at' | 'updated_at' | 'started_at' | 'completed_at' | 'completed_by' | 'issue_description'
>;

type UpdateInstructionData = Partial<
  Omit<RepurposingInstruction, 'id' | 'wedding_id' | 'created_at' | 'updated_at'>
>;

// =============================================================================
// Create Repurposing Instruction
// =============================================================================

async function createRepurposingInstruction(
  instruction: CreateInstructionData
): Promise<RepurposingInstruction> {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .insert({
      wedding_id: instruction.wedding_id,
      wedding_item_id: instruction.wedding_item_id,
      from_event_id: instruction.from_event_id,
      from_event_end_time: instruction.from_event_end_time,
      pickup_location: instruction.pickup_location,
      pickup_time: instruction.pickup_time,
      pickup_time_relative: instruction.pickup_time_relative,
      to_event_id: instruction.to_event_id,
      to_event_start_time: instruction.to_event_start_time,
      dropoff_location: instruction.dropoff_location,
      dropoff_time: instruction.dropoff_time,
      dropoff_time_relative: instruction.dropoff_time_relative,
      responsible_party: instruction.responsible_party,
      responsible_vendor_id: instruction.responsible_vendor_id || null,
      handling_notes: instruction.handling_notes,
      setup_required: instruction.setup_required,
      breakdown_required: instruction.breakdown_required,
      is_critical: instruction.is_critical,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating repurposing instruction:', error);
    throw error;
  }

  return data;
}

export function useCreateRepurposingInstruction(weddingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepurposingInstruction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repurposingKeys.list(weddingId) });
      queryClient.invalidateQueries({ queryKey: repurposingKeys.itemsWithInstructions(weddingId) });
      toast.success('Repurposing instruction created successfully');
    },
    onError: (error) => {
      console.error('Error creating repurposing instruction:', error);
      toast.error('Failed to create repurposing instruction. Please try again.');
    },
  });
}

// =============================================================================
// Update Repurposing Instruction
// =============================================================================

interface UpdateInstructionParams {
  instructionId: string;
  updates: UpdateInstructionData;
}

async function updateRepurposingInstruction({
  instructionId,
  updates,
}: UpdateInstructionParams): Promise<RepurposingInstruction> {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .update(updates)
    .eq('id', instructionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating repurposing instruction:', error);
    throw error;
  }

  return data;
}

export function useUpdateRepurposingInstruction(weddingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRepurposingInstruction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: repurposingKeys.list(weddingId) });
      queryClient.invalidateQueries({ queryKey: repurposingKeys.detail(data.id) });
      toast.success('Repurposing instruction updated successfully');
    },
    onError: (error) => {
      console.error('Error updating repurposing instruction:', error);
      toast.error('Failed to update repurposing instruction. Please try again.');
    },
  });
}

// =============================================================================
// Delete Repurposing Instruction
// =============================================================================

async function deleteRepurposingInstruction(instructionId: string): Promise<void> {
  const { error } = await supabase
    .from('repurposing_instructions')
    .delete()
    .eq('id', instructionId);

  if (error) {
    console.error('Error deleting repurposing instruction:', error);
    throw error;
  }
}

export function useDeleteRepurposingInstruction(weddingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRepurposingInstruction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repurposingKeys.list(weddingId) });
      queryClient.invalidateQueries({ queryKey: repurposingKeys.itemsWithInstructions(weddingId) });
      toast.success('Repurposing instruction deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting repurposing instruction:', error);
      toast.error('Failed to delete repurposing instruction. Please try again.');
    },
  });
}

// =============================================================================
// Status Update Mutations
// =============================================================================

/**
 * Start work on an instruction (pending → in_progress)
 */
export function useStartInstruction(weddingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instructionId: string) => {
      const { error } = await supabase
        .from('repurposing_instructions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', instructionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repurposingKeys.list(weddingId) });
      toast.success('Instruction started');
    },
    onError: (error) => {
      console.error('Error starting instruction:', error);
      toast.error('Failed to start instruction. Please try again.');
    },
  });
}

/**
 * Complete an instruction (in_progress → completed)
 */
interface CompleteInstructionParams {
  instructionId: string;
  completedBy: string;
}

export function useCompleteInstruction(weddingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ instructionId, completedBy }: CompleteInstructionParams) => {
      const { error } = await supabase
        .from('repurposing_instructions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: completedBy,
        })
        .eq('id', instructionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repurposingKeys.list(weddingId) });
      toast.success('Instruction completed');
    },
    onError: (error) => {
      console.error('Error completing instruction:', error);
      toast.error('Failed to complete instruction. Please try again.');
    },
  });
}

/**
 * Report an issue with an instruction
 */
interface ReportIssueParams {
  instructionId: string;
  issueDescription: string;
}

export function useReportIssue(weddingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ instructionId, issueDescription }: ReportIssueParams) => {
      const { error } = await supabase
        .from('repurposing_instructions')
        .update({
          status: 'issue',
          issue_description: issueDescription,
        })
        .eq('id', instructionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repurposingKeys.list(weddingId) });
      toast.success('Issue reported');
    },
    onError: (error) => {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue. Please try again.');
    },
  });
}

/**
 * Resume work after resolving issue (issue → in_progress)
 */
export function useResumeInstruction(weddingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instructionId: string) => {
      const { error } = await supabase
        .from('repurposing_instructions')
        .update({
          status: 'in_progress',
          issue_description: null,
          started_at: new Date().toISOString(),
        })
        .eq('id', instructionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repurposingKeys.list(weddingId) });
      toast.success('Instruction resumed');
    },
    onError: (error) => {
      console.error('Error resuming instruction:', error);
      toast.error('Failed to resume instruction. Please try again.');
    },
  });
}
