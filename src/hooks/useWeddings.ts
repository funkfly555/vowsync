import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TEMP_USER_ID } from '@/lib/constants';
import type { Wedding, WeddingFormData, WeddingListFilters } from '@/types/wedding';

// List weddings with filters
export function useWeddings(filters: WeddingListFilters) {
  return useQuery({
    queryKey: ['weddings', filters],
    queryFn: async () => {
      let query = supabase
        .from('weddings')
        .select('*')
        .eq('consultant_id', TEMP_USER_ID);

      // Search filter
      if (filters.search) {
        query = query.or(
          `bride_name.ilike.%${filters.search}%,groom_name.ilike.%${filters.search}%`
        );
      }

      // Status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Sorting
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      return data as Wedding[];
    },
  });
}

// Get single wedding
export function useWedding(id: string) {
  return useQuery({
    queryKey: ['wedding', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .eq('id', id)
        .eq('consultant_id', TEMP_USER_ID)
        .single();

      if (error) throw error;
      return data as Wedding;
    },
    enabled: !!id,
  });
}

// Create wedding
export function useCreateWedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WeddingFormData) => {
      const { data: wedding, error } = await supabase
        .from('weddings')
        .insert({
          ...data,
          consultant_id: TEMP_USER_ID,
          wedding_date: data.wedding_date.toISOString().split('T')[0],
          venue_address: data.venue_address || null,
          venue_contact_name: data.venue_contact_name || null,
          venue_contact_phone: data.venue_contact_phone || null,
          venue_contact_email: data.venue_contact_email || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return wedding as Wedding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
    },
  });
}

// Update wedding
export function useUpdateWedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WeddingFormData }) => {
      const { data: wedding, error } = await supabase
        .from('weddings')
        .update({
          ...data,
          wedding_date: data.wedding_date.toISOString().split('T')[0],
          venue_address: data.venue_address || null,
          venue_contact_name: data.venue_contact_name || null,
          venue_contact_phone: data.venue_contact_phone || null,
          venue_contact_email: data.venue_contact_email || null,
          notes: data.notes || null,
        })
        .eq('id', id)
        .eq('consultant_id', TEMP_USER_ID)
        .select()
        .single();

      if (error) throw error;
      return wedding as Wedding;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
      queryClient.invalidateQueries({ queryKey: ['wedding', variables.id] });
    },
  });
}

// Delete wedding
export function useDeleteWedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('weddings')
        .delete()
        .eq('id', id)
        .eq('consultant_id', TEMP_USER_ID);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
    },
  });
}
