/**
 * GuestModal - Add/Edit Guest Modal with 5-Tab Interface
 * @feature 007-guest-crud-attendance
 *
 * Container component wrapping all 5 tabs with React Hook Form
 * Tabs: Basic Info, RSVP, Dietary, Meal, Events
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGuest } from '@/hooks/useGuests';
import { useGuestMutations } from '@/hooks/useGuestMutations';
import {
  GuestFormData,
  DEFAULT_GUEST_FORM_DATA,
  EventAttendanceFormData,
} from '@/types/guest';
import { guestFormSchema } from '@/schemas/guest';
import { GuestBasicInfoTab } from './GuestBasicInfoTab';
import { GuestRsvpTab } from './GuestRsvpTab';
import { GuestDietaryTab } from './GuestDietaryTab';
import { GuestMealTab } from './GuestMealTab';
import { GuestEventsTab } from './GuestEventsTab';
import { cn } from '@/lib/utils';

interface GuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  guestId?: string; // undefined = create mode, string = edit mode
  onSuccess?: () => void;
}

type TabId = 'basic' | 'rsvp' | 'dietary' | 'meal' | 'events';

const TABS: { id: TabId; label: string }[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'rsvp', label: 'RSVP' },
  { id: 'dietary', label: 'Dietary' },
  { id: 'meal', label: 'Meal' },
  { id: 'events', label: 'Events' },
];

export function GuestModal({
  open,
  onOpenChange,
  weddingId,
  guestId,
  onSuccess,
}: GuestModalProps) {
  const isEditMode = !!guestId;
  const [activeTab, setActiveTab] = useState<TabId>('basic');

  // Fetch existing guest data in edit mode
  const { guest, isLoading: isLoadingGuest } = useGuest(guestId);

  // Mutations
  const { createGuest, updateGuest } = useGuestMutations(weddingId);

  // Form setup
  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: DEFAULT_GUEST_FORM_DATA,
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (isEditMode && guest) {
      // Transform guest data to form data
      const eventAttendance: EventAttendanceFormData[] =
        guest.event_attendance?.map((ea) => ({
          event_id: ea.event_id,
          attending: ea.attending,
          shuttle_to_event: ea.shuttle_to_event ?? null,
          shuttle_from_event: ea.shuttle_from_event ?? null,
          notes: ea.notes ?? null,
        })) || [];

      reset({
        name: guest.name,
        guest_type: guest.guest_type,
        email: guest.email || '',
        phone: guest.phone || '',
        invitation_status: guest.invitation_status,
        attendance_confirmed: guest.attendance_confirmed,
        rsvp_deadline: guest.rsvp_deadline
          ? new Date(guest.rsvp_deadline)
          : null,
        rsvp_received_date: guest.rsvp_received_date
          ? new Date(guest.rsvp_received_date)
          : null,
        rsvp_method: guest.rsvp_method,
        has_plus_one: guest.has_plus_one,
        plus_one_name: guest.plus_one_name || '',
        plus_one_confirmed: guest.plus_one_confirmed,
        dietary_restrictions: guest.dietary_restrictions || '',
        allergies: guest.allergies || '',
        dietary_notes: guest.dietary_notes || '',
        starter_choice: guest.starter_choice,
        main_choice: guest.main_choice,
        dessert_choice: guest.dessert_choice,
        event_attendance: eventAttendance,
      });
    }
  }, [isEditMode, guest, reset]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setActiveTab('basic');
      if (!isEditMode) {
        reset(DEFAULT_GUEST_FORM_DATA);
      }
    }
  }, [open, isEditMode, reset]);

  // Check which tabs have errors
  const getTabsWithErrors = (): Set<TabId> => {
    const tabsWithErrors = new Set<TabId>();

    if (errors.name || errors.email || errors.phone || errors.guest_type || errors.invitation_status || errors.attendance_confirmed) {
      tabsWithErrors.add('basic');
    }
    if (errors.rsvp_deadline || errors.rsvp_received_date || errors.rsvp_method || errors.has_plus_one || errors.plus_one_name || errors.plus_one_confirmed) {
      tabsWithErrors.add('rsvp');
    }
    if (errors.dietary_restrictions || errors.allergies || errors.dietary_notes) {
      tabsWithErrors.add('dietary');
    }
    if (errors.starter_choice || errors.main_choice || errors.dessert_choice) {
      tabsWithErrors.add('meal');
    }
    if (errors.event_attendance) {
      tabsWithErrors.add('events');
    }

    return tabsWithErrors;
  };

  const tabsWithErrors = getTabsWithErrors();

  const onSubmit = async (data: GuestFormData) => {
    try {
      if (isEditMode && guestId) {
        await updateGuest.mutateAsync({
          guest_id: guestId,
          data,
        });
        toast.success(`${data.name} has been updated successfully.`);
      } else {
        await createGuest.mutateAsync({
          wedding_id: weddingId,
          data,
        });
        toast.success(`${data.name} has been added to the guest list.`);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving guest:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} guest. Please try again.`);
    }
  };

  const isPending = createGuest.isPending || updateGuest.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-full max-h-full md:max-w-2xl md:max-h-[85vh] md:h-auto overflow-y-auto rounded-none md:rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Guest' : 'Add New Guest'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update guest information across all sections.'
              : 'Fill in guest details. Only name is required to save.'}
          </DialogDescription>
        </DialogHeader>

        {isEditMode && isLoadingGuest ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabId)}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-5 mb-4">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      'relative',
                      tabsWithErrors.has(tab.id) && 'text-red-500'
                    )}
                  >
                    {tab.label}
                    {tabsWithErrors.has(tab.id) && (
                      <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="min-h-[300px]">
                <TabsContent value="basic" className="mt-0">
                  <GuestBasicInfoTab form={form} />
                </TabsContent>

                <TabsContent value="rsvp" className="mt-0">
                  <GuestRsvpTab form={form} />
                </TabsContent>

                <TabsContent value="dietary" className="mt-0">
                  <GuestDietaryTab form={form} />
                </TabsContent>

                <TabsContent value="meal" className="mt-0">
                  <GuestMealTab form={form} />
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                  <GuestEventsTab form={form} weddingId={weddingId} />
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Guest'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
