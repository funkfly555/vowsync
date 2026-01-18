/**
 * GuestRsvpTab - Tab 2: RSVP Information
 * @feature 007-guest-crud-attendance
 * @feature 020-dashboard-settings-fix - Added Invitation Status as first field
 *
 * Fields: Invitation Status, RSVP Deadline, RSVP Received Date, RSVP Method (conditional),
 *         Has Plus One, Plus One Name (conditional), Plus One Confirmed (conditional)
 */

import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { GuestFormData, RsvpMethod } from '@/types/guest';

interface GuestRsvpTabProps {
  form: UseFormReturn<GuestFormData>;
}

const INVITATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'To Be Sent' },
  { value: 'invited', label: 'Invited' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
];

const RSVP_METHOD_OPTIONS: { value: RsvpMethod; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'in_person', label: 'In Person' },
  { value: 'online', label: 'Online' },
];

export function GuestRsvpTab({ form }: GuestRsvpTabProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const invitationStatus = watch('invitation_status');
  const rsvpDeadline = watch('rsvp_deadline');
  const rsvpReceivedDate = watch('rsvp_received_date');
  const rsvpMethod = watch('rsvp_method');
  const hasPlusOne = watch('has_plus_one');
  const plusOneConfirmed = watch('plus_one_confirmed');

  return (
    <div className="space-y-4">
      {/* Invitation Status - Primary field */}
      <div className="space-y-2">
        <Label htmlFor="invitation_status">
          Invitation Status <span className="text-red-500">*</span>
        </Label>
        <Select
          value={invitationStatus}
          onValueChange={(value) =>
            setValue('invitation_status', value as GuestFormData['invitation_status'])
          }
        >
          <SelectTrigger id="invitation_status" className="font-medium">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {INVITATION_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* RSVP Deadline */}
      <div className="space-y-2">
        <Label>RSVP Deadline</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !rsvpDeadline && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {rsvpDeadline ? format(rsvpDeadline, 'PPP') : 'Select deadline'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={rsvpDeadline ?? undefined}
              onSelect={(date) => setValue('rsvp_deadline', date ?? null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setValue('rsvp_deadline', null)}
          className="text-xs text-muted-foreground"
        >
          Clear deadline
        </Button>
      </div>

      {/* RSVP Received Date */}
      <div className="space-y-2">
        <Label>RSVP Received Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !rsvpReceivedDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {rsvpReceivedDate
                ? format(rsvpReceivedDate, 'PPP')
                : 'Select date received'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={rsvpReceivedDate ?? undefined}
              onSelect={(date) => setValue('rsvp_received_date', date ?? null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setValue('rsvp_received_date', null);
            setValue('rsvp_method', null);
          }}
          className="text-xs text-muted-foreground"
        >
          Clear received date
        </Button>
      </div>

      {/* RSVP Method - Only shown when RSVP Received Date is set */}
      {rsvpReceivedDate && (
        <div className="space-y-2">
          <Label htmlFor="rsvp_method">
            RSVP Method <span className="text-red-500">*</span>
          </Label>
          <Select
            value={rsvpMethod ?? ''}
            onValueChange={(value) =>
              setValue('rsvp_method', value as RsvpMethod)
            }
          >
            <SelectTrigger
              id="rsvp_method"
              className={cn(errors.rsvp_method && 'border-red-500')}
            >
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {RSVP_METHOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rsvp_method && (
            <p className="text-sm text-red-500">{errors.rsvp_method.message}</p>
          )}
        </div>
      )}

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-3">Plus One</h4>

        {/* Has Plus One */}
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="has_plus_one"
            checked={hasPlusOne}
            onCheckedChange={(checked) => {
              setValue('has_plus_one', checked === true);
              if (!checked) {
                setValue('plus_one_name', '');
                setValue('plus_one_confirmed', false);
              }
            }}
          />
          <Label htmlFor="has_plus_one" className="cursor-pointer">
            Guest has a plus one
          </Label>
        </div>

        {/* Plus One Name - Only shown when Has Plus One is checked */}
        {hasPlusOne && (
          <>
            <div className="space-y-2 mb-4">
              <Label htmlFor="plus_one_name">
                Plus One Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plus_one_name"
                {...register('plus_one_name')}
                placeholder="Enter plus one name"
                aria-invalid={!!errors.plus_one_name}
              />
              {errors.plus_one_name && (
                <p className="text-sm text-red-500">
                  {errors.plus_one_name.message}
                </p>
              )}
            </div>

            {/* Plus One Confirmed */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="plus_one_confirmed"
                checked={plusOneConfirmed}
                onCheckedChange={(checked) =>
                  setValue('plus_one_confirmed', checked === true)
                }
              />
              <Label htmlFor="plus_one_confirmed" className="cursor-pointer">
                Plus one confirmed
              </Label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
