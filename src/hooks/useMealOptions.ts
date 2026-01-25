/**
 * useMealOptions Hook - TanStack Query hooks for meal options data
 * @feature 024-guest-menu-management
 * @task T010, T011
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  MealOption,
  MealOptionInput,
  MealOptionsByCourse,
  CourseType,
  groupMealOptionsByCourse,
} from '@/types/meal-option';
import { logActivity, activityDescriptions } from '@/lib/activityLog';

// =============================================================================
// Query Hooks
// =============================================================================

interface UseMealOptionsParams {
  weddingId: string;
}

interface UseMealOptionsReturn {
  mealOptions: MealOption[];
  mealOptionsByCourse: MealOptionsByCourse;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchMealOptions(weddingId: string): Promise<MealOption[]> {
  const { data, error } = await supabase
    .from('meal_options')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('course_type', { ascending: true })
    .order('option_number', { ascending: true });

  if (error) {
    console.error('Error fetching meal options:', error);
    throw error;
  }

  return data || [];
}

/**
 * Hook to fetch all meal options for a wedding
 */
export function useMealOptions({ weddingId }: UseMealOptionsParams): UseMealOptionsReturn {
  const queryKey = ['meal_options', weddingId];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchMealOptions(weddingId),
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mealOptions = data || [];
  const mealOptionsByCourse = groupMealOptionsByCourse(mealOptions);

  return {
    mealOptions,
    mealOptionsByCourse,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to fetch meal options for a specific course
 */
export function useMealOptionsByCourse(weddingId: string, courseType: CourseType) {
  const { mealOptionsByCourse, isLoading, isError, error } = useMealOptions({ weddingId });

  return {
    options: mealOptionsByCourse[courseType],
    isLoading,
    isError,
    error,
  };
}

// =============================================================================
// Mutation Hooks
// =============================================================================

interface UseMealOptionMutationsParams {
  weddingId: string;
}

export function useMealOptionMutations({ weddingId }: UseMealOptionMutationsParams) {
  const queryClient = useQueryClient();

  const invalidateMealOptions = () => {
    queryClient.invalidateQueries({ queryKey: ['meal_options', weddingId] });
  };

  // Create meal option mutation
  const createMealOption = useMutation({
    mutationFn: async (data: Omit<MealOptionInput, 'wedding_id'>) => {
      const { data: mealOption, error } = await supabase
        .from('meal_options')
        .insert([{ wedding_id: weddingId, ...data }])
        .select()
        .single();

      if (error) {
        console.error('Error creating meal option:', error);
        throw error;
      }

      // Log activity (fire-and-forget)
      logActivity({
        weddingId,
        actionType: 'created',
        entityType: 'meal_option',
        entityId: mealOption.id,
        description: activityDescriptions.mealOption.created(mealOption.meal_name, mealOption.course_type),
      });

      return mealOption;
    },
    onSuccess: () => {
      toast.success('Meal option added successfully');
      invalidateMealOptions();
    },
    onError: (error: Error) => {
      toast.error(`Failed to add meal option: ${error.message}`);
    },
  });

  // Update meal option mutation
  const updateMealOption = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MealOptionInput> }) => {
      const { data: mealOption, error } = await supabase
        .from('meal_options')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating meal option:', error);
        throw error;
      }

      // Log activity (fire-and-forget)
      logActivity({
        weddingId,
        actionType: 'updated',
        entityType: 'meal_option',
        entityId: id,
        description: activityDescriptions.mealOption.updated(mealOption.meal_name),
        changes: data as Record<string, unknown>,
      });

      return mealOption;
    },
    onSuccess: () => {
      toast.success('Meal option updated successfully');
      invalidateMealOptions();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update meal option: ${error.message}`);
    },
  });

  // Delete meal option mutation
  const deleteMealOption = useMutation({
    mutationFn: async (id: string) => {
      // Fetch meal option info before deleting for activity log
      const { data: mealOption } = await supabase
        .from('meal_options')
        .select('meal_name, course_type')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('meal_options')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting meal option:', error);
        throw error;
      }

      // Log activity (fire-and-forget)
      if (mealOption) {
        logActivity({
          weddingId,
          actionType: 'deleted',
          entityType: 'meal_option',
          entityId: id,
          description: activityDescriptions.mealOption.deleted(mealOption.meal_name, mealOption.course_type),
        });
      }
    },
    onSuccess: () => {
      toast.success('Meal option deleted successfully');
      invalidateMealOptions();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete meal option: ${error.message}`);
    },
  });

  return {
    createMealOption,
    updateMealOption,
    deleteMealOption,
  };
}

// =============================================================================
// Guest Meal Selection Stats
// =============================================================================

interface MealSelectionStats {
  courseType: CourseType;
  optionNumber: number;
  mealName: string;
  guestCount: number;
  plusOneCount: number;
  totalCount: number;
}

interface UseMealSelectionStatsReturn {
  stats: MealSelectionStats[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

async function fetchMealSelectionStats(weddingId: string): Promise<MealSelectionStats[]> {
  // Fetch meal options
  const { data: mealOptions, error: optionsError } = await supabase
    .from('meal_options')
    .select('*')
    .eq('wedding_id', weddingId);

  if (optionsError) throw optionsError;

  // Fetch guests with their meal selections
  const { data: guests, error: guestsError } = await supabase
    .from('guests')
    .select('starter_choice, main_choice, dessert_choice, plus_one_starter_choice, plus_one_main_choice, plus_one_dessert_choice, has_plus_one')
    .eq('wedding_id', weddingId);

  if (guestsError) throw guestsError;

  // Calculate stats for each meal option
  const stats: MealSelectionStats[] = (mealOptions || []).map((option) => {
    const courseField = `${option.course_type}_choice` as keyof typeof guests[0];
    const plusOneCourseField = `plus_one_${option.course_type}_choice` as keyof typeof guests[0];

    const guestCount = (guests || []).filter(
      (g) => g[courseField] === option.option_number
    ).length;

    const plusOneCount = (guests || []).filter(
      (g) => g.has_plus_one && g[plusOneCourseField] === option.option_number
    ).length;

    return {
      courseType: option.course_type as CourseType,
      optionNumber: option.option_number,
      mealName: option.meal_name,
      guestCount,
      plusOneCount,
      totalCount: guestCount + plusOneCount,
    };
  });

  return stats;
}

/**
 * Hook to fetch meal selection statistics (how many guests chose each option)
 */
export function useMealSelectionStats(weddingId: string): UseMealSelectionStatsReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['meal_selection_stats', weddingId],
    queryFn: () => fetchMealSelectionStats(weddingId),
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    stats: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}
