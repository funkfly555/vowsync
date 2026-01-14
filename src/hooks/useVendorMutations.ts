/**
 * useVendorMutations Hook - CRUD mutations for vendors
 * @feature 008-vendor-management
 * @task T020, T026, T030
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { VendorSchemaType } from '@/schemas/vendor';

interface UseVendorMutationsParams {
  weddingId: string;
}

export function useVendorMutations({ weddingId }: UseVendorMutationsParams) {
  const queryClient = useQueryClient();

  const invalidateVendors = () => {
    queryClient.invalidateQueries({ queryKey: ['vendors', weddingId] });
  };

  const invalidateVendor = (vendorId: string) => {
    queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
  };

  // Create vendor mutation
  const createVendor = useMutation({
    mutationFn: async (data: VendorSchemaType) => {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .insert([{ wedding_id: weddingId, ...data }])
        .select()
        .single();

      if (error) {
        console.error('Error creating vendor:', error);
        throw error;
      }

      return vendor;
    },
    onSuccess: () => {
      toast.success('Vendor created successfully');
      invalidateVendors();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create vendor: ${error.message}`);
    },
  });

  // Update vendor mutation
  const updateVendor = useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: VendorSchemaType }) => {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', vendorId)
        .select()
        .single();

      if (error) {
        console.error('Error updating vendor:', error);
        throw error;
      }

      return vendor;
    },
    onSuccess: (_, variables) => {
      toast.success('Vendor updated successfully');
      invalidateVendors();
      invalidateVendor(variables.vendorId);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update vendor: ${error.message}`);
    },
  });

  // Delete vendor mutation
  const deleteVendor = useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) {
        console.error('Error deleting vendor:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Vendor deleted successfully');
      invalidateVendors();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete vendor: ${error.message}`);
    },
  });

  return {
    createVendor,
    updateVendor,
    deleteVendor,
  };
}
