/**
 * useVendorContactMutations Hook - TanStack Query mutations for vendor contacts
 * @feature 009-vendor-payments-invoices
 * T042: Create, update, delete contact mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { VendorContact, VendorContactFormData } from '@/types/vendor';

// =============================================================================
// Create Contact Mutation
// =============================================================================

interface CreateContactVariables {
  vendorId: string;
  data: VendorContactFormData;
}

async function createContact({ vendorId, data }: CreateContactVariables): Promise<VendorContact> {
  // If this is set as primary, first unset any existing primary contacts
  if (data.is_primary) {
    await supabase
      .from('vendor_contacts')
      .update({ is_primary: false })
      .eq('vendor_id', vendorId)
      .eq('is_primary', true);
  }

  const { data: contact, error } = await supabase
    .from('vendor_contacts')
    .insert({
      vendor_id: vendorId,
      contact_name: data.contact_name,
      contact_role: data.contact_role || null,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
      is_primary: data.is_primary || false,
      is_onsite_contact: data.is_onsite_contact || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating contact:', error);
    throw error;
  }

  return contact;
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContact,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', variables.vendorId] });
      toast.success('Contact added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add contact', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// Update Contact Mutation
// =============================================================================

interface UpdateContactVariables {
  contactId: string;
  vendorId: string;
  data: Partial<VendorContactFormData>;
}

async function updateContact({ contactId, vendorId, data }: UpdateContactVariables): Promise<VendorContact> {
  // If setting this as primary, first unset any existing primary contacts
  if (data.is_primary) {
    await supabase
      .from('vendor_contacts')
      .update({ is_primary: false })
      .eq('vendor_id', vendorId)
      .eq('is_primary', true)
      .neq('id', contactId);
  }

  const updateData: Record<string, unknown> = {};

  // Only include fields that are provided
  if (data.contact_name !== undefined) updateData.contact_name = data.contact_name;
  if (data.contact_role !== undefined) updateData.contact_role = data.contact_role || null;
  if (data.contact_email !== undefined) updateData.contact_email = data.contact_email || null;
  if (data.contact_phone !== undefined) updateData.contact_phone = data.contact_phone || null;
  if (data.is_primary !== undefined) updateData.is_primary = data.is_primary;
  if (data.is_onsite_contact !== undefined) updateData.is_onsite_contact = data.is_onsite_contact;

  const { data: contact, error } = await supabase
    .from('vendor_contacts')
    .update(updateData)
    .eq('id', contactId)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact:', error);
    throw error;
  }

  return contact;
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContact,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', variables.vendorId] });
      toast.success('Contact updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update contact', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// Delete Contact Mutation
// =============================================================================

interface DeleteContactVariables {
  contactId: string;
  vendorId: string;
}

async function deleteContact({ contactId }: DeleteContactVariables): Promise<void> {
  const { error } = await supabase
    .from('vendor_contacts')
    .delete()
    .eq('id', contactId);

  if (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContact,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', variables.vendorId] });
      toast.success('Contact deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete contact', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}
