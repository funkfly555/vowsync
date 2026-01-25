/**
 * useEmailTemplates Hook - Fetch email templates list
 * @feature 016-email-campaigns
 * @task T010
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EmailTemplate, TemplateType } from '@/types/email';

// =============================================================================
// Query Key Factory
// =============================================================================

export const emailTemplateKeys = {
  all: ['email-templates'] as const,
  lists: () => [...emailTemplateKeys.all, 'list'] as const,
  list: (consultantId: string, filters?: EmailTemplatesFilters) =>
    [...emailTemplateKeys.lists(), consultantId, filters] as const,
  details: () => [...emailTemplateKeys.all, 'detail'] as const,
  detail: (templateId: string) => [...emailTemplateKeys.details(), templateId] as const,
};

// =============================================================================
// Types
// =============================================================================

export interface EmailTemplatesFilters {
  templateType?: TemplateType | 'all';
  isActive?: boolean;
  isDefault?: boolean;
  search?: string;
}

interface UseEmailTemplatesParams {
  consultantId: string;
  filters?: EmailTemplatesFilters;
}

interface UseEmailTemplatesReturn {
  templates: EmailTemplate[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchEmailTemplates(
  consultantId: string,
  filters?: EmailTemplatesFilters
): Promise<EmailTemplate[]> {
  let query = supabase
    .from('email_templates')
    .select('*')
    .eq('consultant_id', consultantId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters) {
    if (filters.templateType && filters.templateType !== 'all') {
      query = query.eq('template_type', filters.templateType);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters.isDefault !== undefined) {
      query = query.eq('is_default', filters.isDefault);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching email templates:', error);
    throw error;
  }

  return data || [];
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook to fetch all email templates for a consultant
 *
 * @param consultantId - The consultant ID to fetch templates for
 * @param filters - Optional filter criteria
 */
export function useEmailTemplates({
  consultantId,
  filters,
}: UseEmailTemplatesParams): UseEmailTemplatesReturn {
  const queryKey = emailTemplateKeys.list(consultantId, filters);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchEmailTemplates(consultantId, filters),
    enabled: !!consultantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Apply client-side search filter
  let templates = data || [];
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    templates = templates.filter(
      (t) =>
        t.template_name.toLowerCase().includes(searchLower) ||
        t.subject.toLowerCase().includes(searchLower)
    );
  }

  return {
    templates,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Helper: Get Default Template
// =============================================================================

/**
 * Get the default template for a specific type
 */
export function useDefaultTemplate(consultantId: string, templateType: TemplateType) {
  return useQuery({
    queryKey: [...emailTemplateKeys.list(consultantId), 'default', templateType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('template_type', templateType)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) {
        // No default template is not an error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as EmailTemplate;
    },
    enabled: !!consultantId && !!templateType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
