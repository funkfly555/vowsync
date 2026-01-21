/**
 * RsvpTab - RSVP tracking form fields with Plus One column
 * Deadline, received date, method, notes fields
 * Plus One RSVP is read-only (follows primary guest)
 * @feature 021-guest-page-redesign
 * @task T020, T032
 */

import { useFormContext, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { GuestEditFormData, RsvpMethod, InvitationStatus, INVITATION_STATUS_CONFIG } from '@/types/guest';

const INVITATION_STATUSES: InvitationStatus[] = ['pending', 'invited', 'confirmed', 'declined'];
const RSVP_METHODS: { value: RsvpMethod; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'in_person', label: 'In Person' },
  { value: 'online', label: 'Online' },
];

export function RsvpTab() {
  const {
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<GuestEditFormData>();

  const rsvpMethod = watch('rsvp_method');
  const hasPlusOne = watch('has_plus_one');
  const plusOneName = watch('plus_one_name');
  const plusOneConfirmed = watch('plus_one_confirmed');
  const invitationStatus = watch('invitation_status');

  return (
    <div className="p-4">
      {/* Two-column layout on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Primary Guest RSVP Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">Primary Guest RSVP</h3>

          {/* Invitation Status (moved from Basic Info - 025-guest-page-fixes) */}
          <div className="space-y-2">
            <Label htmlFor="invitation_status">Invitation Status</Label>
            <Select
              value={invitationStatus}
              onValueChange={(value) => setValue('invitation_status', value as InvitationStatus, { shouldDirty: true })}
            >
              <SelectTrigger id="invitation_status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {INVITATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {INVITATION_STATUS_CONFIG[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RSVP Deadline */}
          <div className="space-y-2">
            <Label>RSVP Deadline</Label>
            <Controller
              control={control}
              name="rsvp_deadline"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => field.onChange(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.rsvp_deadline && (
              <p className="text-sm text-red-500">{errors.rsvp_deadline.message}</p>
            )}
          </div>

          {/* RSVP Received Date */}
          <div className="space-y-2">
            <Label>RSVP Received Date</Label>
            <Controller
              control={control}
              name="rsvp_received_date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : 'Not received yet'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => field.onChange(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.rsvp_received_date && (
              <p className="text-sm text-red-500">{errors.rsvp_received_date.message}</p>
            )}
          </div>

          {/* RSVP Method */}
          <div className="space-y-2">
            <Label htmlFor="rsvp_method">RSVP Method</Label>
            <Select
              value={rsvpMethod || '__none__'}
              onValueChange={(value) =>
                setValue('rsvp_method', (value === '__none__' ? null : value) as RsvpMethod | null, { shouldDirty: true })
              }
            >
              <SelectTrigger id="rsvp_method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {RSVP_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RSVP Notes */}
          <div className="space-y-2">
            <Label htmlFor="rsvp_notes">RSVP Notes</Label>
            <Controller
              control={control}
              name="rsvp_notes"
              render={({ field }) => (
                <Textarea
                  id="rsvp_notes"
                  {...field}
                  placeholder="Any notes about the RSVP..."
                  className="min-h-[80px]"
                />
              )}
            />
            {errors.rsvp_notes && (
              <p className="text-sm text-red-500">{errors.rsvp_notes.message}</p>
            )}
          </div>
        </div>

        {/* Plus One RSVP Column (Read-Only) */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Plus One RSVP
          </h3>

          {hasPlusOne ? (
            <>
              {/* Plus One RSVP Info */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Plus One</p>
                  <p className="font-medium">{plusOneName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    INVITATION_STATUS_CONFIG[invitationStatus].bgColor,
                    INVITATION_STATUS_CONFIG[invitationStatus].color
                  )}>
                    {INVITATION_STATUS_CONFIG[invitationStatus].label}
                  </span>
                </div>
              </div>

              {/* Plus One Confirmed Checkbox (moved from Basic Info - 025-guest-page-fixes) */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  id="plus_one_confirmed"
                  checked={plusOneConfirmed}
                  onCheckedChange={(checked) =>
                    setValue('plus_one_confirmed', checked === true, { shouldDirty: true })
                  }
                />
                <Label
                  htmlFor="plus_one_confirmed"
                  className="text-sm font-normal cursor-pointer"
                >
                  Plus one attendance confirmed
                </Label>
              </div>

              {/* Note about Plus One RSVP */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-medium">Note</p>
                <p className="mt-1 text-blue-600">
                  The plus one follows the primary guest's invitation status. To update plus one name, use the Basic Info tab.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg text-center">
              <UserPlus className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">
                No plus one for this guest.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Enable plus one in the Basic Info tab.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
