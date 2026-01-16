/**
 * useTaskMutations Hook - CRUD mutations for tasks
 * @feature 015-task-management-kanban
 * @task T007
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { taskKeys } from './useTasks';
import {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  TaskStatus,
} from '@/types/task';
import { calculateDaysRelativeToWedding } from '@/lib/taskUtils';

interface UseTaskMutationsParams {
  weddingId: string;
  weddingDate?: string;
}

export function useTaskMutations({ weddingId, weddingDate }: UseTaskMutationsParams) {
  const queryClient = useQueryClient();

  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.list(weddingId) });
  };

  const invalidateTask = (taskId: string) => {
    queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
  };

  // ==========================================================================
  // Create Task Mutation
  // ==========================================================================

  const createTask = useMutation({
    mutationFn: async (data: Omit<CreateTaskInput, 'wedding_id' | 'is_pre_wedding' | 'days_before_after_wedding'>) => {
      // Calculate days relative to wedding if wedding date is available
      let isPreWedding = true;
      let daysBeforeAfter: number | null = null;

      if (weddingDate && data.due_date) {
        const result = calculateDaysRelativeToWedding(data.due_date, weddingDate);
        isPreWedding = result.is_pre_wedding;
        daysBeforeAfter = result.days_before_after_wedding;
      }

      const { data: task, error } = await supabase
        .from('pre_post_wedding_tasks')
        .insert([
          {
            wedding_id: weddingId,
            ...data,
            is_pre_wedding: isPreWedding,
            days_before_after_wedding: daysBeforeAfter,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      return task;
    },
    onSuccess: () => {
      toast.success('Task created successfully');
      invalidateTasks();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });

  // ==========================================================================
  // Update Task Mutation
  // ==========================================================================

  const updateTask = useMutation({
    mutationFn: async ({ id, ...data }: UpdateTaskInput) => {
      // Recalculate days relative to wedding if due date changed
      let updateData: Record<string, unknown> = { ...data };

      if (weddingDate && data.due_date) {
        const result = calculateDaysRelativeToWedding(data.due_date, weddingDate);
        updateData.is_pre_wedding = result.is_pre_wedding;
        updateData.days_before_after_wedding = result.days_before_after_wedding;
      }

      const { data: task, error } = await supabase
        .from('pre_post_wedding_tasks')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      return task;
    },
    onSuccess: (_, variables) => {
      toast.success('Task updated successfully');
      invalidateTasks();
      invalidateTask(variables.id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });

  // ==========================================================================
  // Delete Task Mutation
  // ==========================================================================

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('pre_post_wedding_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Task deleted successfully');
      invalidateTasks();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  // ==========================================================================
  // Update Task Status Mutation (for drag-and-drop and quick actions)
  // ==========================================================================

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status, completed_date, completed_by }: UpdateTaskStatusInput) => {
      // Prepare update data
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Set completion tracking for 'completed' status
      if (status === 'completed') {
        updateData.completed_date = completed_date || new Date().toISOString();
        updateData.completed_by = completed_by || null;
      } else {
        // Clear completion data when moving away from completed
        updateData.completed_date = null;
        updateData.completed_by = null;
      }

      const { data: task, error } = await supabase
        .from('pre_post_wedding_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }

      return task;
    },
    // Optimistic update for immediate UI feedback
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.list(weddingId) });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.list(weddingId));

      // Optimistically update to the new value
      queryClient.setQueryData(taskKeys.list(weddingId), (old: unknown) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((task) => {
          const t = task as { id: string; status: TaskStatus };
          return t.id === id ? { ...t, status } : t;
        });
      });

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (error: Error, _, context) => {
      // Rollback to the previous value on error
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(weddingId), context.previousTasks);
      }
      toast.error(`Failed to update status: ${error.message}`);
    },
    onSuccess: (_, variables) => {
      const statusLabels: Record<TaskStatus, string> = {
        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
      };
      toast.success(`Task marked as ${statusLabels[variables.status]}`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync
      invalidateTasks();
    },
  });

  return {
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  };
}
