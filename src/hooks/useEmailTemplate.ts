/**
 * useEmailTemplate Hook - Fetch single email template
 * @feature 016-email-campaigns
 * @task T011
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EmailTemplate } from '@/types/email';
import { emailTemplateKeys } from './useEmailTemplates';

// =============================================================================
// Types
// =============================================================================

interface UseEmailTemplateReturn {
  template: EmailTemplate | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) {
    // Not found is not an error for this use case
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching email template:', error);
    throw error;
  }

  return data;
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook to fetch a single email template by ID
 *
 * @param templateId - The template ID to fetch (can be undefined for create mode)
 */
export function useEmailTemplate(templateId: string | undefined): UseEmailTemplateReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: emailTemplateKeys.detail(templateId || ''),
    queryFn: () => fetchEmailTemplate(templateId!),
    enabled: !!templateId,
  });

  return {
    template: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
