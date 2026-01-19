/**
 * GuestCard - Main expandable card container component
 * Manages expand/collapse state and coordinates collapsed/expanded views
 * @feature 021-guest-page-redesign
 * @task T007, T014, T017, T024-T028
 */

import { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GuestCardCollapsed } from './GuestCardCollapsed';
import { GuestCardExpanded } from './GuestCardExpanded';
import { BasicInfoTab, RsvpTab, SeatingTab, DietaryTab, MealsTab } from './tabs';
import { GuestCardDisplayItem, GuestEditFormData, TabName } from '@/types/guest';
import { guestEditSchema } from '@/schemas/guest';
import { useGuestMutations } from '@/hooks/useGuestMutations';
import { toast } from 'sonner';

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
      return <MealsTab />;
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
}

export function GuestCard({
  guest,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
}: GuestCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { updateGuest } = useGuestMutations(guest.wedding_id);

  // Initialize form with guest data
  const formMethods = useForm<GuestEditFormData>({
    resolver: zodResolver(guestEditSchema),
    defaultValues: guestToFormData(guest),
  });

  const { formState: { isDirty }, reset, handleSubmit } = formMethods;

  // Handle card expand toggle
  const handleToggleExpand = useCallback(() => {
    onToggleExpand(guest.id);
  }, [guest.id, onToggleExpand]);

  // Handle selection toggle
  const handleToggleSelect = useCallback(() => {
    onToggleSelect(guest.id);
  }, [guest.id, onToggleSelect]);

  // Handle form save
  const handleSave = handleSubmit(async (data) => {
    setIsSaving(true);
    try {
      await updateGuest.mutateAsync({
        guest_id: guest.id,
        data: formDataToGuestUpdate(data),
      });
      toast.success(`${data.name} has been updated.`);
      reset(data); // Reset form with new data to clear dirty state
    } catch (error) {
      console.error('Error updating guest:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExpanded) {
      handleToggleExpand();
    }
  };

  return (
    <div
      className="bg-white overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* Collapsed view - always visible */}
      <GuestCardCollapsed
        guest={guest}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onToggleExpand={handleToggleExpand}
        onToggleSelect={handleToggleSelect}
      />

      {/* Expanded view - animated in/out */}
      <FormProvider {...formMethods}>
        <GuestCardExpanded
          guest={guest}
          isExpanded={isExpanded}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={handleSave}
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
  };
}

/**
 * Convert form data to guest update request format
 * Includes all fields from the 5-tab interface
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
    // Meals
    starter_choice: data.starter_choice,
    main_choice: data.main_choice,
    dessert_choice: data.dessert_choice,
  };
}
