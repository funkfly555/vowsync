/**
 * useVendors Hook - TanStack Query hooks for vendor data
 * @feature 008-vendor-management
 * @task T013
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Vendor,
  VendorDisplay,
  VendorFilters,
  toVendorDisplay,
  calculateContractStatus,
  calculatePaymentStatus,
} from '@/types/vendor';

// =============================================================================
// Fetch All Vendors
// =============================================================================

interface UseVendorsParams {
  weddingId: string;
  filters?: VendorFilters;
}

interface UseVendorsReturn {
  vendors: VendorDisplay[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchVendors(weddingId: string): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('company_name', { ascending: true });

  if (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }

  return data || [];
}

/**
 * Hook to fetch all vendors for a wedding with optional filtering
 */
export function useVendors({ weddingId, filters }: UseVendorsParams): UseVendorsReturn {
  const queryKey = ['vendors', weddingId];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchVendors(weddingId),
    enabled: !!weddingId,
  });

  // Transform vendors and apply client-side filters
  const transformedVendors: VendorDisplay[] = (data || [])
    .map(toVendorDisplay)
    .filter((vendor) => {
      if (!filters) return true;

      // Apply search filter (client-side for real-time with debounce)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesCompany = vendor.company_name.toLowerCase().includes(searchLower);
        const matchesContact = vendor.contact_name.toLowerCase().includes(searchLower);
        if (!matchesCompany && !matchesContact) {
          return false;
        }
      }

      // Apply vendor type filter
      if (filters.vendorType !== 'all') {
        if (vendor.vendor_type !== filters.vendorType) {
          return false;
        }
      }

      // Apply contract status filter (client-side since it's calculated)
      if (filters.contractStatus !== 'all') {
        const status = calculateContractStatus(vendor);
        if (status.label !== filters.contractStatus) {
          return false;
        }
      }

      // Apply payment status filter (client-side since it's calculated)
      if (filters.paymentStatus !== 'all') {
        const status = calculatePaymentStatus(vendor);
        if (status.label !== filters.paymentStatus) {
          return false;
        }
      }

      return true;
    });

  return {
    vendors: transformedVendors,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Fetch Single Vendor
// =============================================================================

interface UseVendorReturn {
  vendor: VendorDisplay | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

async function fetchVendor(vendorId: string): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .single();

  if (error) {
    console.error('Error fetching vendor:', error);
    throw error;
  }

  return data;
}

/**
 * Hook to fetch a single vendor by ID
 */
export function useVendor(vendorId: string | undefined): UseVendorReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => fetchVendor(vendorId!),
    enabled: !!vendorId,
  });

  return {
    vendor: data ? toVendorDisplay(data) : null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
