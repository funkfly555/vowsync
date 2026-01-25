/**
 * useRecipients Hook - Recipient filtering for email campaigns
 * @feature 016-email-campaigns
 * @task T008
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  Recipient,
  RecipientType,
  GuestFilter,
  VendorFilter,
  RecipientFilter,
  RecipientSelectionResult,
} from '@/types/email';

// =============================================================================
// Query Key Factory
// =============================================================================

export const recipientKeys = {
  all: ['recipients'] as const,
  lists: () => [...recipientKeys.all, 'list'] as const,
  list: (weddingId: string, type: RecipientType, filter?: RecipientFilter) =>
    [...recipientKeys.lists(), weddingId, type, filter] as const,
};

// =============================================================================
// Hook Parameters
// =============================================================================

interface UseRecipientsParams {
  weddingId: string;
  recipientType: RecipientType;
  filter?: RecipientFilter | null;
  excludeInvalidEmails?: boolean;
}

interface UseRecipientsReturn {
  result: RecipientSelectionResult;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// =============================================================================
// Fetch Functions
// =============================================================================

/**
 * Fetch guest recipients with optional filtering
 */
async function fetchGuestRecipients(
  weddingId: string,
  filter: GuestFilter | null,
  excludeInvalid: boolean
): Promise<Recipient[]> {
  let query = supabase
    .from('guests')
    .select('id, name, email, email_valid')
    .eq('wedding_id', weddingId)
    .not('email', 'is', null);

  // Exclude invalid emails if requested (for bounce handling - US4)
  if (excludeInvalid) {
    query = query.or('email_valid.is.null,email_valid.eq.true');
  }

  // Apply guest-specific filters
  if (filter) {
    if (filter.invitation_status) {
      query = query.eq('invitation_status', filter.invitation_status);
    }
    if (filter.table_assigned !== undefined) {
      if (filter.table_assigned) {
        query = query.not('table_number', 'is', null);
      } else {
        query = query.is('table_number', null);
      }
    }
    if (filter.has_dietary_restrictions !== undefined) {
      if (filter.has_dietary_restrictions) {
        query = query.not('dietary_restrictions', 'is', null);
      } else {
        query = query.is('dietary_restrictions', null);
      }
    }
  }

  // Handle event filtering separately (requires join)
  if (filter?.event_id) {
    const { data: eventData, error: eventError } = await supabase
      .from('guests')
      .select(`
        id, name, email, email_valid,
        guest_event_attendance!inner(event_id, attending)
      `)
      .eq('wedding_id', weddingId)
      .not('email', 'is', null)
      .eq('guest_event_attendance.event_id', filter.event_id)
      .eq('guest_event_attendance.attending', true)
      .order('name', { ascending: true });

    if (eventError) {
      console.error('Error fetching guest recipients with event filter:', eventError);
      throw eventError;
    }

    // Filter by email validity if needed
    const filteredData = excludeInvalid
      ? (eventData || []).filter((g) => g.email_valid === null || g.email_valid === true)
      : eventData || [];

    return filteredData.map((g) => ({
      id: g.id,
      name: g.name || 'Unnamed Guest',
      email: g.email!,
      type: 'guest' as const,
      email_valid: g.email_valid ?? true,
    }));
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) {
    console.error('Error fetching guest recipients:', error);
    throw error;
  }

  return (data || []).map((g) => ({
    id: g.id,
    name: g.name || 'Unnamed Guest',
    email: g.email!,
    type: 'guest' as const,
    email_valid: g.email_valid ?? true,
  }));
}

/**
 * Fetch vendor recipients with optional filtering
 */
async function fetchVendorRecipients(
  weddingId: string,
  filter: VendorFilter | null,
  _excludeInvalid: boolean
): Promise<Recipient[]> {
  let query = supabase
    .from('vendors')
    .select('id, company_name, contact_email')
    .eq('wedding_id', weddingId)
    .not('contact_email', 'is', null);

  // Note: vendors table doesn't have email_valid column yet
  // Bounce handling for vendors would require a migration

  // Apply vendor-specific filters
  if (filter) {
    if (filter.vendor_type) {
      query = query.eq('vendor_type', filter.vendor_type);
    }
    if (filter.contract_status) {
      query = query.eq('contract_signed', filter.contract_status === 'signed');
    }
    // payment_status filter would require additional schema
  }

  const { data, error } = await query.order('company_name', { ascending: true });

  if (error) {
    console.error('Error fetching vendor recipients:', error);
    throw error;
  }

  return (data || []).map((v) => ({
    id: v.id,
    name: v.company_name || 'Unnamed Vendor',
    email: v.contact_email!,
    type: 'vendor' as const,
    email_valid: true, // Default to true since column doesn't exist
  }));
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook to fetch and filter recipients for email campaigns
 *
 * @param weddingId - The wedding ID to fetch recipients for
 * @param recipientType - 'guest' or 'vendor'
 * @param filter - Optional filter criteria
 * @param excludeInvalidEmails - Whether to exclude recipients with invalid emails (default: true)
 */
export function useRecipients({
  weddingId,
  recipientType,
  filter = null,
  excludeInvalidEmails = true,
}: UseRecipientsParams): UseRecipientsReturn {
  const queryKey = recipientKeys.list(weddingId, recipientType, filter || undefined);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (recipientType === 'guest') {
        return fetchGuestRecipients(
          weddingId,
          filter as GuestFilter | null,
          excludeInvalidEmails
        );
      } else {
        return fetchVendorRecipients(
          weddingId,
          filter as VendorFilter | null,
          excludeInvalidEmails
        );
      }
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recipients = data || [];
  const invalidEmailCount = recipients.filter((r) => r.email_valid === false).length;

  return {
    result: {
      recipients: excludeInvalidEmails
        ? recipients.filter((r) => r.email_valid !== false)
        : recipients,
      totalCount: recipients.length,
      invalidEmailCount,
    },
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Additional Utilities
// =============================================================================

/**
 * Hook to get recipient counts for preview
 */
export function useRecipientCount({
  weddingId,
  recipientType,
  filter = null,
}: Omit<UseRecipientsParams, 'excludeInvalidEmails'>) {
  const { result, isLoading } = useRecipients({
    weddingId,
    recipientType,
    filter,
    excludeInvalidEmails: true,
  });

  return {
    count: result.totalCount,
    invalidCount: result.invalidEmailCount,
    isLoading,
  };
}
