/**
 * useTasks Hook - TanStack Query hooks for task data
 * @feature 015-task-management-kanban
 * @task T006
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  PrePostWeddingTask,
  TaskWithVendor,
  TaskFilters,
} from '@/types/task';
import { toTaskWithOverdue } from '@/lib/taskUtils';

// =============================================================================
// Query Keys Factory
// =============================================================================

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (weddingId: string) => [...taskKeys.lists(), weddingId] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// =============================================================================
// Fetch Functions
// =============================================================================

interface TaskWithVendorRow extends PrePostWeddingTask {
  vendors: {
    id: string;
    company_name: string;
  } | null;
}

async function fetchTasks(weddingId: string): Promise<TaskWithVendor[]> {
  const { data, error } = await supabase
    .from('pre_post_wedding_tasks')
    .select(`
      *,
      vendors:vendor_id (
        id,
        company_name
      )
    `)
    .eq('wedding_id', weddingId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  // Transform to TaskWithVendor
  return (data || []).map((row: TaskWithVendorRow) => ({
    ...toTaskWithOverdue(row),
    vendor: row.vendors,
  }));
}

async function fetchTask(taskId: string): Promise<TaskWithVendor | null> {
  const { data, error } = await supabase
    .from('pre_post_wedding_tasks')
    .select(`
      *,
      vendors:vendor_id (
        id,
        company_name
      )
    `)
    .eq('id', taskId)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    throw error;
  }

  if (!data) return null;

  const row = data as TaskWithVendorRow;
  return {
    ...toTaskWithOverdue(row),
    vendor: row.vendors,
  };
}

// =============================================================================
// Filter Function (Client-Side)
// =============================================================================

function applyFilters(
  tasks: TaskWithVendor[],
  filters?: TaskFilters
): TaskWithVendor[] {
  if (!filters) return tasks;

  return tasks.filter((task) => {
    // Search filter (title and description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    // Status filter
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      if (!statuses.includes(task.status)) {
        return false;
      }
    }

    // Priority filter
    if (filters.priority) {
      const priorities = Array.isArray(filters.priority)
        ? filters.priority
        : [filters.priority];
      if (!priorities.includes(task.priority)) {
        return false;
      }
    }

    // Task type filter
    if (filters.task_type) {
      const types = Array.isArray(filters.task_type)
        ? filters.task_type
        : [filters.task_type];
      if (!types.includes(task.task_type)) {
        return false;
      }
    }

    // Assigned to filter
    if (filters.assigned_to) {
      if (task.assigned_to !== filters.assigned_to) {
        return false;
      }
    }

    // Pre/post wedding filter
    if (filters.is_pre_wedding !== undefined) {
      if (task.is_pre_wedding !== filters.is_pre_wedding) {
        return false;
      }
    }

    return true;
  });
}

// =============================================================================
// Hooks
// =============================================================================

interface UseTasksParams {
  weddingId: string;
  filters?: TaskFilters;
}

interface UseTasksReturn {
  tasks: TaskWithVendor[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch all tasks for a wedding with optional filtering
 */
export function useTasks({ weddingId, filters }: UseTasksParams): UseTasksReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: taskKeys.list(weddingId),
    queryFn: () => fetchTasks(weddingId),
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Apply client-side filters
  const filteredTasks = applyFilters(data || [], filters);

  return {
    tasks: filteredTasks,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

interface UseTaskReturn {
  task: TaskWithVendor | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook to fetch a single task by ID
 */
export function useTask(taskId: string | undefined): UseTaskReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: taskKeys.detail(taskId!),
    queryFn: () => fetchTask(taskId!),
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    task: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

// =============================================================================
// Vendors Dropdown Helper
// =============================================================================

interface VendorOption {
  id: string;
  company_name: string;
}

interface UseVendorsForDropdownReturn {
  vendors: VendorOption[];
  isLoading: boolean;
}

/**
 * Hook to fetch vendors for dropdown selection in task form
 */
export function useVendorsForDropdown(weddingId: string): UseVendorsForDropdownReturn {
  const { data, isLoading } = useQuery({
    queryKey: ['vendors', weddingId, 'dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('wedding_id', weddingId)
        .eq('status', 'active')
        .order('company_name', { ascending: true });

      if (error) {
        console.error('Error fetching vendors for dropdown:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    vendors: data || [],
    isLoading,
  };
}
