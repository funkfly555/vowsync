/**
 * useVendorMutations Hook - CRUD mutations for vendors
 * @feature 008-vendor-management
 * @task T020, T026, T030
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { VendorSchemaType } from '@/schemas/vendor';
import { logActivity, activityDescriptions } from '@/lib/activityLog';

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

      // Log activity (fire-and-forget)
      logActivity({
        weddingId,
        actionType: 'created',
        entityType: 'vendor',
        entityId: vendor.id,
        description: activityDescriptions.vendor.created(vendor.company_name),
      });

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
  // Accepts partial data for auto-save scenarios
  const updateVendor = useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: Partial<VendorSchemaType> }) => {
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

      // Log activity (fire-and-forget)
      logActivity({
        weddingId,
        actionType: 'updated',
        entityType: 'vendor',
        entityId: vendorId,
        description: activityDescriptions.vendor.updated(vendor.company_name),
        changes: data as Record<string, unknown>,
      });

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
      // Fetch vendor info before deleting for activity log
      const { data: vendor } = await supabase
        .from('vendors')
        .select('company_name')
        .eq('id', vendorId)
        .single();

      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) {
        console.error('Error deleting vendor:', error);
        throw error;
      }

      // Log activity (fire-and-forget)
      if (vendor) {
        logActivity({
          weddingId,
          actionType: 'deleted',
          entityType: 'vendor',
          entityId: vendorId,
          description: activityDescriptions.vendor.deleted(vendor.company_name),
        });
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
