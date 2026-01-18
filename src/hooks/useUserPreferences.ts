/**
 * Hook to fetch and update user preferences
 * @feature 020-dashboard-settings-fix
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserPreferences, CurrencyCode } from '@/types/settings';
import { DEFAULT_PREFERENCES } from '@/types/settings';

/**
 * Fetches and manages user preferences
 * - Reads from users.preferences JSONB column
 * - Provides defaults when preferences are empty
 * - Mutation to update preferences with merge
 */
export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['userPreferences', userId],
    queryFn: async (): Promise<UserPreferences> => {
      if (!userId) {
        return DEFAULT_PREFERENCES;
      }

      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (error) {
        // If user doesn't exist in users table yet, return defaults
        if (error.code === 'PGRST116') {
          return DEFAULT_PREFERENCES;
        }
        throw error;
      }

      // Merge with defaults to ensure all fields have values
      const storedPrefs = (data?.preferences as UserPreferences) || {};
      return {
        currency: storedPrefs.currency || DEFAULT_PREFERENCES.currency,
        timezone: storedPrefs.timezone || DEFAULT_PREFERENCES.timezone,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes - preferences don't change often
  });

  const mutation = useMutation({
    mutationFn: async (newPreferences: Partial<UserPreferences>) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get current preferences to merge
      const currentPrefs = query.data || DEFAULT_PREFERENCES;
      const mergedPrefs: UserPreferences = {
        ...currentPrefs,
        ...newPreferences,
      };

      const { error } = await supabase
        .from('users')
        .update({ preferences: mergedPrefs })
        .eq('id', userId);

      if (error) throw error;

      return mergedPrefs;
    },
    onSuccess: (data) => {
      // Update cache immediately
      queryClient.setQueryData(['userPreferences', userId], data);
    },
  });

  return {
    preferences: query.data || DEFAULT_PREFERENCES,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updatePreferences: mutation,
  };
}

/**
 * Get the currency from preferences, with fallback to default
 */
export function useCurrencyPreference(): CurrencyCode {
  const { preferences } = useUserPreferences();
  return preferences.currency || DEFAULT_PREFERENCES.currency;
}
