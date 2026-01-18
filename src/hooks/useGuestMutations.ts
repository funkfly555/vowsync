/**
 * useGuestMutations Hook - TanStack Query mutations for guest CRUD operations
 * @feature 007-guest-crud-attendance
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Guest,
  GuestFormData,
  CreateGuestRequest,
  UpdateGuestRequest,
  DeleteGuestRequest,
  BulkTableAssignmentRequest,
  AttendanceUpdatePayload,
} from '@/types/guest';
import { logActivity, activityDescriptions } from '@/lib/activityLog';

/**
 * Transform form data to database insert format
 * Converts Date objects to ISO strings for Supabase
 */
function transformFormDataForInsert(
  weddingId: string,
  data: GuestFormData
): Omit<Guest, 'id' | 'created_at' | 'updated_at' | 'email_valid' | 'table_position' | 'rsvp_notes' | 'last_reminder_sent_date'> {
  return {
    wedding_id: weddingId,
    name: data.name,
    guest_type: data.guest_type,
    email: data.email || null,
    phone: data.phone || null,
    invitation_status: data.invitation_status,
    rsvp_deadline: data.rsvp_deadline?.toISOString().split('T')[0] || null,
    rsvp_received_date: data.rsvp_received_date?.toISOString().split('T')[0] || null,
    rsvp_method: data.rsvp_method,
    has_plus_one: data.has_plus_one,
    plus_one_name: data.plus_one_name || null,
    plus_one_confirmed: data.plus_one_confirmed,
    table_number: null, // Table assignment is separate
    dietary_restrictions: data.dietary_restrictions || null,
    allergies: data.allergies || null,
    dietary_notes: data.dietary_notes || null,
    starter_choice: data.starter_choice,
    main_choice: data.main_choice,
    dessert_choice: data.dessert_choice,
    notes: null,
  };
}

/**
 * Transform form data to database update format
 */
function transformFormDataForUpdate(
  data: Partial<GuestFormData>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (data.name !== undefined) result.name = data.name;
  if (data.guest_type !== undefined) result.guest_type = data.guest_type;
  if (data.email !== undefined) result.email = data.email || null;
  if (data.phone !== undefined) result.phone = data.phone || null;
  if (data.invitation_status !== undefined) result.invitation_status = data.invitation_status;
  if (data.rsvp_deadline !== undefined) {
    result.rsvp_deadline = data.rsvp_deadline?.toISOString().split('T')[0] || null;
  }
  if (data.rsvp_received_date !== undefined) {
    result.rsvp_received_date = data.rsvp_received_date?.toISOString().split('T')[0] || null;
  }
  if (data.rsvp_method !== undefined) result.rsvp_method = data.rsvp_method;
  if (data.has_plus_one !== undefined) result.has_plus_one = data.has_plus_one;
  if (data.plus_one_name !== undefined) result.plus_one_name = data.plus_one_name || null;
  if (data.plus_one_confirmed !== undefined) result.plus_one_confirmed = data.plus_one_confirmed;
  if (data.dietary_restrictions !== undefined) result.dietary_restrictions = data.dietary_restrictions || null;
  if (data.allergies !== undefined) result.allergies = data.allergies || null;
  if (data.dietary_notes !== undefined) result.dietary_notes = data.dietary_notes || null;
  if (data.starter_choice !== undefined) result.starter_choice = data.starter_choice;
  if (data.main_choice !== undefined) result.main_choice = data.main_choice;
  if (data.dessert_choice !== undefined) result.dessert_choice = data.dessert_choice;

  return result;
}

/**
 * Create a new guest with event attendance records
 */
async function createGuest(request: CreateGuestRequest): Promise<Guest> {
  const { wedding_id, data } = request;

  // Insert guest
  const guestData = transformFormDataForInsert(wedding_id, data);
  const { data: guest, error: guestError } = await supabase
    .from('guests')
    .insert(guestData)
    .select()
    .single();

  if (guestError) {
    console.error('Error creating guest:', guestError);
    throw new Error(guestError.message);
  }

  // Insert event attendance records if any
  if (data.event_attendance && data.event_attendance.length > 0) {
    const attendanceRecords = data.event_attendance
      .filter((ea) => ea.attending || ea.shuttle_to_event || ea.shuttle_from_event)
      .map((ea) => ({
        guest_id: guest.id,
        event_id: ea.event_id,
        attending: ea.attending,
        shuttle_to_event: ea.shuttle_to_event || null,
        shuttle_from_event: ea.shuttle_from_event || null,
      }));

    if (attendanceRecords.length > 0) {
      const { error: attendanceError } = await supabase
        .from('guest_event_attendance')
        .insert(attendanceRecords);

      if (attendanceError) {
        console.error('Error creating attendance records:', attendanceError);
        // Don't throw - guest was created, attendance is secondary
      }
    }
  }

  // Log activity (fire-and-forget)
  logActivity({
    weddingId: wedding_id,
    actionType: 'created',
    entityType: 'guest',
    entityId: guest.id,
    description: activityDescriptions.guest.created(guest.name),
  });

  return guest;
}

/**
 * Update an existing guest with event attendance records
 */
async function updateGuest(request: UpdateGuestRequest): Promise<Guest> {
  const { guest_id, data } = request;

  // Update guest fields
  const guestData = transformFormDataForUpdate(data);

  if (Object.keys(guestData).length > 0) {
    const { error: guestError } = await supabase
      .from('guests')
      .update(guestData)
      .eq('id', guest_id);

    if (guestError) {
      console.error('Error updating guest:', guestError);
      throw new Error(guestError.message);
    }
  }

  // Update event attendance using UPSERT
  if (data.event_attendance) {
    const attendanceRecords = data.event_attendance.map((ea) => ({
      guest_id: guest_id,
      event_id: ea.event_id,
      attending: ea.attending,
      shuttle_to_event: ea.shuttle_to_event || null,
      shuttle_from_event: ea.shuttle_from_event || null,
    }));

    if (attendanceRecords.length > 0) {
      const { error: attendanceError } = await supabase
        .from('guest_event_attendance')
        .upsert(attendanceRecords, {
          onConflict: 'guest_id,event_id',
        });

      if (attendanceError) {
        console.error('Error upserting attendance records:', attendanceError);
        // Don't throw - guest was updated, attendance is secondary
      }
    }
  }

  // Fetch and return updated guest
  const { data: updatedGuest, error: fetchError } = await supabase
    .from('guests')
    .select()
    .eq('id', guest_id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // Log activity (fire-and-forget)
  logActivity({
    weddingId: updatedGuest.wedding_id,
    actionType: 'updated',
    entityType: 'guest',
    entityId: guest_id,
    description: activityDescriptions.guest.updated(updatedGuest.name),
    changes: guestData,
  });

  return updatedGuest;
}

/**
 * Delete a guest (cascade deletes attendance records)
 */
async function deleteGuest(request: DeleteGuestRequest): Promise<void> {
  const { guest_id } = request;

  // Fetch guest info before deleting for activity log
  const { data: guest } = await supabase
    .from('guests')
    .select('name, wedding_id')
    .eq('id', guest_id)
    .single();

  const { error } = await supabase.from('guests').delete().eq('id', guest_id);

  if (error) {
    console.error('Error deleting guest:', error);
    throw new Error(error.message);
  }

  // Log activity (fire-and-forget)
  if (guest) {
    logActivity({
      weddingId: guest.wedding_id,
      actionType: 'deleted',
      entityType: 'guest',
      entityId: guest_id,
      description: activityDescriptions.guest.deleted(guest.name),
    });
  }
}

/**
 * Bulk assign table number to multiple guests
 */
async function bulkAssignTable(request: BulkTableAssignmentRequest): Promise<void> {
  const { guest_ids, table_number } = request;

  const { error } = await supabase
    .from('guests')
    .update({ table_number })
    .in('id', guest_ids);

  if (error) {
    console.error('Error bulk assigning tables:', error);
    throw new Error(error.message);
  }
}

/**
 * Save attendance matrix changes (batch UPSERT)
 */
async function saveAttendanceMatrix(
  _weddingId: string,
  updates: AttendanceUpdatePayload[]
): Promise<void> {
  if (updates.length === 0) return;

  const records = updates.map((update) => ({
    guest_id: update.guest_id,
    event_id: update.event_id,
    attending: update.attending,
    shuttle_to_event: update.shuttle_to_event,
    shuttle_from_event: update.shuttle_from_event,
  }));

  const { error } = await supabase
    .from('guest_event_attendance')
    .upsert(records, {
      onConflict: 'guest_id,event_id',
    });

  if (error) {
    console.error('Error saving attendance matrix:', error);
    throw new Error(error.message);
  }
}

/**
 * Hook providing all guest mutation operations
 */
export function useGuestMutations(weddingId: string) {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
    queryClient.invalidateQueries({ queryKey: ['guest'] });
    // Invalidate dashboard stats so they refresh when navigating back
    queryClient.invalidateQueries({ queryKey: ['guestStats', weddingId] });
    queryClient.invalidateQueries({ queryKey: ['dashboardMetrics', weddingId] });
  };

  const createGuestMutation = useMutation({
    mutationFn: createGuest,
    onSuccess: () => {
      invalidateQueries();
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: updateGuest,
    onSuccess: () => {
      invalidateQueries();
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: deleteGuest,
    onSuccess: () => {
      invalidateQueries();
    },
  });

  const bulkAssignTableMutation = useMutation({
    mutationFn: bulkAssignTable,
    onSuccess: () => {
      invalidateQueries();
    },
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: (updates: AttendanceUpdatePayload[]) =>
      saveAttendanceMatrix(weddingId, updates),
    onSuccess: () => {
      invalidateQueries();
      queryClient.invalidateQueries({ queryKey: ['attendance-matrix', weddingId] });
    },
  });

  return {
    createGuest: {
      mutate: createGuestMutation.mutate,
      mutateAsync: createGuestMutation.mutateAsync,
      isPending: createGuestMutation.isPending,
      isError: createGuestMutation.isError,
      error: createGuestMutation.error,
    },
    updateGuest: {
      mutate: updateGuestMutation.mutate,
      mutateAsync: updateGuestMutation.mutateAsync,
      isPending: updateGuestMutation.isPending,
      isError: updateGuestMutation.isError,
      error: updateGuestMutation.error,
    },
    deleteGuest: {
      mutate: deleteGuestMutation.mutate,
      mutateAsync: deleteGuestMutation.mutateAsync,
      isPending: deleteGuestMutation.isPending,
      isError: deleteGuestMutation.isError,
      error: deleteGuestMutation.error,
    },
    bulkAssignTable: {
      mutate: bulkAssignTableMutation.mutate,
      mutateAsync: bulkAssignTableMutation.mutateAsync,
      isPending: bulkAssignTableMutation.isPending,
      isError: bulkAssignTableMutation.isError,
      error: bulkAssignTableMutation.error,
    },
    saveAttendance: {
      mutate: saveAttendanceMutation.mutate,
      mutateAsync: saveAttendanceMutation.mutateAsync,
      isPending: saveAttendanceMutation.isPending,
      isError: saveAttendanceMutation.isError,
      error: saveAttendanceMutation.error,
    },
  };
}
