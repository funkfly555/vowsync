/**
 * useVendorContacts Hook - TanStack Query hooks for vendor contact data
 * @feature 009-vendor-payments-invoices
 * T015: Fetch contacts for vendor
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VendorContact } from '@/types/vendor';

// =============================================================================
// Fetch All Contacts for Vendor
// =============================================================================

interface UseVendorContactsReturn {
  contacts: VendorContact[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchVendorContacts(vendorId: string): Promise<VendorContact[]> {
  const { data, error } = await supabase
    .from('vendor_contacts')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('is_primary', { ascending: false })
    .order('contact_name', { ascending: true });

  if (error) {
    console.error('Error fetching vendor contacts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Hook to fetch all contacts for a vendor
 * Sorted by is_primary desc (primary first), then by contact_name asc
 */
export function useVendorContacts(vendorId: string | undefined): UseVendorContactsReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['vendor-contacts', vendorId],
    queryFn: () => fetchVendorContacts(vendorId!),
    enabled: !!vendorId,
  });

  return {
    contacts: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Fetch Single Contact
// =============================================================================

interface UseVendorContactReturn {
  contact: VendorContact | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

async function fetchVendorContact(contactId: string): Promise<VendorContact | null> {
  const { data, error } = await supabase
    .from('vendor_contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (error) {
    console.error('Error fetching vendor contact:', error);
    throw error;
  }

  return data;
}

/**
 * Hook to fetch a single contact by ID
 */
export function useVendorContact(contactId: string | undefined): UseVendorContactReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendor-contact', contactId],
    queryFn: () => fetchVendorContact(contactId!),
    enabled: !!contactId,
  });

  return {
    contact: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

// =============================================================================
// Primary Contact Helper
// =============================================================================

/**
 * Get the primary contact from a list of contacts
 */
export function getPrimaryContact(contacts: VendorContact[]): VendorContact | null {
  return contacts.find((contact) => contact.is_primary) || contacts[0] || null;
}

/**
 * Get onsite contacts from a list of contacts
 */
export function getOnsiteContacts(contacts: VendorContact[]): VendorContact[] {
  return contacts.filter((contact) => contact.is_onsite_contact);
}
