/**
 * useEmailCampaign Hook - Fetch single email campaign
 * @feature 016-email-campaigns
 * @task T021
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EmailCampaignWithTemplate } from '@/types/email';
import { emailCampaignKeys } from './useEmailCampaigns';

// =============================================================================
// Types
// =============================================================================

interface UseEmailCampaignReturn {
  campaign: EmailCampaignWithTemplate | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchEmailCampaign(campaignId: string): Promise<EmailCampaignWithTemplate | null> {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select(`
      *,
      email_templates(template_name, template_type)
    `)
    .eq('id', campaignId)
    .single();

  if (error) {
    // Not found is not an error for this use case
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching email campaign:', error);
    throw error;
  }

  return data;
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook to fetch a single email campaign by ID
 *
 * @param campaignId - The campaign ID to fetch (can be undefined)
 */
export function useEmailCampaign(campaignId: string | undefined): UseEmailCampaignReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: emailCampaignKeys.detail(campaignId || ''),
    queryFn: () => fetchEmailCampaign(campaignId!),
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    campaign: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
