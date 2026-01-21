/**
 * GuestCard - Main expandable card container component
 * Manages expand/collapse state and coordinates collapsed/expanded views
 * @feature 021-guest-page-redesign
 * @task T007, T014, T017, T024-T028
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GuestCardCollapsed } from './GuestCardCollapsed';
import { GuestCardExpanded } from './GuestCardExpanded';
import { BasicInfoTab, RsvpTab, SeatingTab, DietaryTab, MealsTab, EventsShuttlesTab } from './tabs';
import { GuestCardDisplayItem, GuestEditFormData, TabName, EventAttendanceFormData } from '@/types/guest';
import { guestEditSchema } from '@/schemas/guest';
import { useGuestMutations } from '@/hooks/useGuestMutations';
import { toast } from 'sonner';

// Auto-save status type
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface TabContentProps {
  tab: TabName;
  guest: GuestCardDisplayItem;
}

/**
 * Render the appropriate tab content based on active tab
 */
function TabContent({ tab, guest }: TabContentProps) {
  switch (tab) {
    case 'basic':
      return <BasicInfoTab />;
    case 'rsvp':
      return <RsvpTab />;
    case 'seating':
      return <SeatingTab guestId={guest.id} guestName={guest.name} weddingId={guest.wedding_id} />;
    case 'dietary':
      return <DietaryTab />;
    case 'meals':
      return <MealsTab weddingId={guest.wedding_id} />;
    case 'events-shuttles':
      return <EventsShuttlesTab weddingId={guest.wedding_id} />;
    default:
      return null;
  }
}

interface GuestCardProps {
  guest: GuestCardDisplayItem;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: (guestId: string) => void;
  onToggleSelect: (guestId: string) => void;
  onDelete?: (guestId: string) => void; // 025-guest-page-fixes
}

export function GuestCard({
  guest,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onDelete,
}: GuestCardProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const { updateGuest } = useGuestMutations(guest.wedding_id);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  // Initialize form with guest data
  const formMethods = useForm<GuestEditFormData>({
    resolver: zodResolver(guestEditSchema),
    defaultValues: guestToFormData(guest),
  });

  const { reset, getValues, watch } = formMethods;

  // Flag to skip watch callback during reset (prevents infinite loop)
  const isResettingRef = useRef(false);

  // Ref to hold the latest performSave function (avoids stale closure issues)
  const performSaveRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Auto-save function
  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const currentValues = getValues();
      await updateGuest.mutateAsync({
        guest_id: guest.id,
        data: formDataToGuestUpdate(currentValues),
      });
      setSaveStatus('saved');

      // Mark as resetting to skip watch callback trigger from reset
      isResettingRef.current = true;
      reset(currentValues); // Reset dirty state with current values
      // Use microtask to clear the flag after React processes the reset
      queueMicrotask(() => {
        isResettingRef.current = false;
      });

      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error auto-saving guest:', error);
      setSaveStatus('error');
      toast.error('Failed to save changes. Please try again.');

      // Reset error status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      isSavingRef.current = false;
    }
  }, [guest.id, updateGuest, reset, getValues]);

  // Keep performSaveRef updated with latest performSave
  performSaveRef.current = performSave;

  // Subscribe to form changes for auto-save
  // watch() fires on any field change - we debounce and save
  useEffect(() => {
    if (!isExpanded) {
      // Clear debounce timer when card is collapsed
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      return;
    }

    const subscription = watch(() => {
      // Skip if we're in the middle of a reset (prevents infinite loop)
      if (isResettingRef.current) return;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the save operation (500ms delay) - 025-guest-page-fixes
      debounceTimerRef.current = setTimeout(() => {
        performSaveRef.current?.();
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isExpanded, watch]);

  // Handle card expand toggle
  const handleToggleExpand = useCallback(() => {
    onToggleExpand(guest.id);
  }, [guest.id, onToggleExpand]);

  // Handle selection toggle
  const handleToggleSelect = useCallback(() => {
    onToggleSelect(guest.id);
  }, [guest.id, onToggleSelect]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExpanded) {
      handleToggleExpand();
    }
  };

  return (
    <div
      className={cn(
        'bg-white overflow-visible relative transition-all duration-300',
        isExpanded && 'z-10 shadow-lg rounded-lg'
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Collapsed view - always visible */}
      <GuestCardCollapsed
        guest={guest}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onToggleExpand={handleToggleExpand}
        onToggleSelect={handleToggleSelect}
        onDelete={onDelete ? () => onDelete(guest.id) : undefined}
      />

      {/* Expanded view - animated in/out */}
      <FormProvider {...formMethods}>
        <GuestCardExpanded
          guest={guest}
          isExpanded={isExpanded}
          saveStatus={saveStatus}
        >
          {(activeTab) => <TabContent tab={activeTab} guest={guest} />}
        </GuestCardExpanded>
      </FormProvider>
    </div>
  );
}

/**
 * Convert Guest entity to form data format
 */
function guestToFormData(guest: GuestCardDisplayItem): GuestEditFormData {
  // Transform eventAttendance from GuestCardDisplayItem
  const eventAttendanceData: EventAttendanceFormData[] =
    guest.eventAttendance?.map((ea) => ({
      event_id: ea.event_id,
      attending: ea.attending,
      shuttle_to_event: ea.shuttle_to_event ?? null,
      shuttle_from_event: ea.shuttle_from_event ?? null,
      notes: ea.notes ?? null,
    })) || [];

  return {
    name: guest.name,
    email: guest.email || '',
    phone: guest.phone || '',
    guest_type: guest.guest_type,
    invitation_status: guest.invitation_status,
    has_plus_one: guest.has_plus_one,
    plus_one_name: guest.plus_one_name || '',
    plus_one_confirmed: guest.plus_one_confirmed,
    rsvp_deadline: guest.rsvp_deadline ? new Date(guest.rsvp_deadline) : null,
    rsvp_received_date: guest.rsvp_received_date ? new Date(guest.rsvp_received_date) : null,
    rsvp_method: guest.rsvp_method,
    rsvp_notes: guest.rsvp_notes || '',
    table_number: guest.table_number || '',
    table_position: guest.table_position,
    dietary_restrictions: guest.dietary_restrictions || '',
    allergies: guest.allergies || '',
    dietary_notes: guest.dietary_notes || '',
    starter_choice: guest.starter_choice,
    main_choice: guest.main_choice,
    dessert_choice: guest.dessert_choice,
    // Plus One Meals (025-guest-page-fixes)
    plus_one_starter_choice: guest.plus_one_starter_choice ?? null,
    plus_one_main_choice: guest.plus_one_main_choice ?? null,
    plus_one_dessert_choice: guest.plus_one_dessert_choice ?? null,
    event_attendance: eventAttendanceData,
    // Wedding party fields (025-guest-page-fixes)
    gender: guest.gender ?? null,
    wedding_party_side: guest.wedding_party_side ?? null,
    wedding_party_role: guest.wedding_party_role ?? null,
  };
}

/**
 * Convert form data to guest update request format
 * Includes all fields from the 6-tab interface
 */
function formDataToGuestUpdate(data: GuestEditFormData): Record<string, unknown> {
  return {
    // Basic Info
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    guest_type: data.guest_type,
    invitation_status: data.invitation_status,
    // Plus One
    has_plus_one: data.has_plus_one,
    plus_one_name: data.plus_one_name || null,
    plus_one_confirmed: data.plus_one_confirmed,
    // RSVP
    rsvp_deadline: data.rsvp_deadline?.toISOString().split('T')[0] || null,
    rsvp_received_date: data.rsvp_received_date?.toISOString().split('T')[0] || null,
    rsvp_method: data.rsvp_method,
    rsvp_notes: data.rsvp_notes || null,
    // Seating
    table_number: data.table_number || null,
    table_position: data.table_position,
    // Dietary
    dietary_restrictions: data.dietary_restrictions || null,
    allergies: data.allergies || null,
    dietary_notes: data.dietary_notes || null,
    // Meals - Primary Guest
    starter_choice: data.starter_choice,
    main_choice: data.main_choice,
    dessert_choice: data.dessert_choice,
    // Meals - Plus One (025-guest-page-fixes)
    plus_one_starter_choice: data.plus_one_starter_choice,
    plus_one_main_choice: data.plus_one_main_choice,
    plus_one_dessert_choice: data.plus_one_dessert_choice,
    // Events & Shuttle (event_attendance)
    event_attendance: data.event_attendance,
    // Wedding party fields (025-guest-page-fixes)
    gender: data.gender,
    wedding_party_side: data.wedding_party_side,
    wedding_party_role: data.wedding_party_role,
  };
}
