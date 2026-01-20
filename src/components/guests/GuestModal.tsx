/**
 * GuestModal - Add/Edit Guest Modal with 6-Tab Interface
 * @feature 024-guest-menu-management
 *
 * Container component wrapping all 6 tabs with React Hook Form
 * Tabs: Basic Info, RSVP, Seating, Dietary, Meals, Events & Shuttles
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Loader2,
  AlertCircle,
  User,
  Mail,
  Armchair,
  Utensils,
  UtensilsCrossed,
  Calendar,
} from 'lucide-react';
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
import { GuestSeatingTab } from './GuestSeatingTab';
import { GuestDietaryTab } from './GuestDietaryTab';
import { GuestMealTab } from './GuestMealTab';
import { GuestEventsShuttlesTab } from './GuestEventsShuttlesTab';
import { cn } from '@/lib/utils';

interface GuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  guestId?: string; // undefined = create mode, string = edit mode
  onSuccess?: () => void;
}

type TabId = 'basic' | 'rsvp' | 'seating' | 'dietary' | 'meals' | 'events-shuttles';

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'rsvp', label: 'RSVP', icon: Mail },
  { id: 'seating', label: 'Seating', icon: Armchair },
  { id: 'dietary', label: 'Dietary', icon: Utensils },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
  { id: 'events-shuttles', label: 'Events & Shuttles', icon: Calendar },
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
        table_number: guest.table_number,
        table_position: guest.table_position,
        dietary_restrictions: guest.dietary_restrictions || '',
        allergies: guest.allergies || '',
        dietary_notes: guest.dietary_notes || '',
        starter_choice: guest.starter_choice,
        main_choice: guest.main_choice,
        dessert_choice: guest.dessert_choice,
        plus_one_starter_choice: guest.plus_one_starter_choice ?? null,
        plus_one_main_choice: guest.plus_one_main_choice ?? null,
        plus_one_dessert_choice: guest.plus_one_dessert_choice ?? null,
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

    if (errors.name || errors.email || errors.phone || errors.guest_type || errors.invitation_status) {
      tabsWithErrors.add('basic');
    }
    if (errors.rsvp_deadline || errors.rsvp_received_date || errors.rsvp_method || errors.has_plus_one || errors.plus_one_name || errors.plus_one_confirmed) {
      tabsWithErrors.add('rsvp');
    }
    // Seating tab errors - handled in form state
    if (errors.dietary_restrictions || errors.allergies || errors.dietary_notes) {
      tabsWithErrors.add('dietary');
    }
    if (errors.starter_choice || errors.main_choice || errors.dessert_choice) {
      tabsWithErrors.add('meals');
    }
    if (errors.event_attendance) {
      tabsWithErrors.add('events-shuttles');
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
      <DialogContent className="w-full max-w-full md:max-w-3xl h-[95vh] md:h-auto md:max-h-[85vh] flex flex-col p-0 gap-0 rounded-none md:rounded-lg overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
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
          <div className="flex items-center justify-center py-12 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabId)}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Fixed Tabs - Always Visible */}
              <div className="px-6 py-2 border-b bg-background flex-shrink-0">
                <TabsList className="w-full h-auto flex overflow-x-auto sm:grid sm:grid-cols-6 gap-1">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          'relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 sm:px-2 text-xs h-auto min-h-[3rem]',
                          tabsWithErrors.has(tab.id) && 'text-red-500'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline text-[10px] leading-tight">{tab.label}</span>
                        {tabsWithErrors.has(tab.id) && (
                          <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
                <TabsContent value="basic" className="mt-0">
                  <GuestBasicInfoTab form={form} />
                </TabsContent>

                <TabsContent value="rsvp" className="mt-0">
                  <GuestRsvpTab form={form} />
                </TabsContent>

                <TabsContent value="seating" className="mt-0">
                  <GuestSeatingTab form={form} />
                </TabsContent>

                <TabsContent value="dietary" className="mt-0">
                  <GuestDietaryTab form={form} />
                </TabsContent>

                <TabsContent value="meals" className="mt-0">
                  <GuestMealTab form={form} weddingId={weddingId} />
                </TabsContent>

                <TabsContent value="events-shuttles" className="mt-0">
                  <GuestEventsShuttlesTab form={form} weddingId={weddingId} />
                </TabsContent>
              </div>
            </Tabs>

            {/* Fixed Footer */}
            <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
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
