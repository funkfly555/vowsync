/**
 * useEmailLogs Hook - Fetch email logs with pagination
 * @feature 016-email-campaigns
 * @task T033
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EmailLog, EmailLogStatus, RecipientType } from '@/types/email';

// =============================================================================
// Query Key Factory
// =============================================================================

export const emailLogKeys = {
  all: ['email-logs'] as const,
  lists: () => [...emailLogKeys.all, 'list'] as const,
  list: (params: EmailLogsParams) => [...emailLogKeys.lists(), params] as const,
  details: () => [...emailLogKeys.all, 'detail'] as const,
  detail: (logId: string) => [...emailLogKeys.details(), logId] as const,
};

// =============================================================================
// Types
// =============================================================================

export interface EmailLogsFilters {
  status?: EmailLogStatus | 'all';
  recipientType?: RecipientType | 'all';
  search?: string;
}

interface EmailLogsParams {
  campaignId?: string;
  weddingId?: string;
  filters?: EmailLogsFilters;
  page?: number;
  pageSize?: number;
}

interface UseEmailLogsParams {
  campaignId?: string;
  weddingId?: string;
  filters?: EmailLogsFilters;
  page?: number;
  pageSize?: number;
}

interface PaginatedEmailLogs {
  logs: EmailLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseEmailLogsReturn {
  data: PaginatedEmailLogs;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchEmailLogs(params: EmailLogsParams): Promise<PaginatedEmailLogs> {
  const { campaignId, weddingId, filters, page = 1, pageSize = 20 } = params;

  // Build the query
  let query = supabase
    .from('email_logs')
    .select('*', { count: 'exact' });

  // Apply campaign or wedding filter
  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  } else if (weddingId) {
    query = query.eq('wedding_id', weddingId);
  }

  // Apply status filter
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  // Apply recipient type filter
  if (filters?.recipientType && filters.recipientType !== 'all') {
    query = query.eq('recipient_type', filters.recipientType);
  }

  // Apply search filter (email or name)
  if (filters?.search) {
    query = query.or(
      `recipient_email.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%`
    );
  }

  // Add ordering and pagination
  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching email logs:', error);
    throw error;
  }

  const totalCount = count || 0;

  return {
    logs: data || [],
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook to fetch email logs with pagination and filtering
 *
 * @param campaignId - Optional campaign ID to filter by
 * @param weddingId - Optional wedding ID to filter by
 * @param filters - Filter criteria
 * @param page - Current page (1-indexed)
 * @param pageSize - Number of items per page
 */
export function useEmailLogs({
  campaignId,
  weddingId,
  filters,
  page = 1,
  pageSize = 20,
}: UseEmailLogsParams): UseEmailLogsReturn {
  const params: EmailLogsParams = { campaignId, weddingId, filters, page, pageSize };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: emailLogKeys.list(params),
    queryFn: () => fetchEmailLogs(params),
    enabled: !!(campaignId || weddingId),
  });

  return {
    data: data || {
      logs: [],
      totalCount: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    },
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Status Statistics Hook
// =============================================================================

interface EmailLogStats {
  total: number;
  byStatus: Record<EmailLogStatus, number>;
}

async function fetchEmailLogStats(campaignId: string): Promise<EmailLogStats> {
  const { data, error } = await supabase
    .from('email_logs')
    .select('status')
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('Error fetching email log stats:', error);
    throw error;
  }

  const stats: EmailLogStats = {
    total: data?.length || 0,
    byStatus: {
      pending: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      soft_bounce: 0,
      hard_bounce: 0,
      failed: 0,
      spam: 0,
    },
  };

  for (const log of data || []) {
    if (log.status in stats.byStatus) {
      stats.byStatus[log.status as EmailLogStatus]++;
    }
  }

  return stats;
}

/**
 * Hook to get email log statistics for a campaign
 */
export function useEmailLogStats(campaignId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...emailLogKeys.list({ campaignId }), 'stats'],
    queryFn: () => fetchEmailLogStats(campaignId!),
    enabled: !!campaignId,
  });

  return {
    stats: data,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
