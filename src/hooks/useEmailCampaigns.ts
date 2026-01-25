/**
 * useEmailCampaigns Hook - Fetch email campaigns list
 * @feature 016-email-campaigns
 * @task T020
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EmailCampaignWithTemplate, CampaignStatus } from '@/types/email';

// =============================================================================
// Query Key Factory
// =============================================================================

export const emailCampaignKeys = {
  all: ['email-campaigns'] as const,
  lists: () => [...emailCampaignKeys.all, 'list'] as const,
  list: (weddingId: string, status?: CampaignStatus) =>
    status
      ? [...emailCampaignKeys.lists(), weddingId, status]
      : [...emailCampaignKeys.lists(), weddingId],
  details: () => [...emailCampaignKeys.all, 'detail'] as const,
  detail: (campaignId: string) => [...emailCampaignKeys.details(), campaignId] as const,
};

// =============================================================================
// Types
// =============================================================================

export interface EmailCampaignsFilters {
  status?: CampaignStatus | 'all';
  search?: string;
}

interface UseEmailCampaignsParams {
  weddingId: string;
  filters?: EmailCampaignsFilters;
}

interface UseEmailCampaignsReturn {
  campaigns: EmailCampaignWithTemplate[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchEmailCampaigns(
  weddingId: string,
  filters?: EmailCampaignsFilters
): Promise<EmailCampaignWithTemplate[]> {
  let query = supabase
    .from('email_campaigns')
    .select(`
      *,
      email_templates(template_name, template_type)
    `)
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false });

  // Apply status filter
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching email campaigns:', error);
    throw error;
  }

  return data || [];
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook to fetch all email campaigns for a wedding
 *
 * @param weddingId - The wedding ID to fetch campaigns for
 * @param filters - Optional filter criteria
 */
export function useEmailCampaigns({
  weddingId,
  filters,
}: UseEmailCampaignsParams): UseEmailCampaignsReturn {
  const queryKey = emailCampaignKeys.list(
    weddingId,
    filters?.status !== 'all' ? filters?.status : undefined
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchEmailCampaigns(weddingId, filters),
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Apply client-side search filter
  let campaigns = data || [];
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    campaigns = campaigns.filter(
      (c) =>
        c.campaign_name.toLowerCase().includes(searchLower) ||
        c.subject.toLowerCase().includes(searchLower)
    );
  }

  return {
    campaigns,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
