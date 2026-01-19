/**
 * BasicInfoTab - Basic guest information form fields
 * Two-column layout: Primary guest (left) and Plus One (right)
 * @feature 021-guest-page-redesign
 * @task T019, T029, T030, T031, T036
 */

import { useFormContext } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GuestEditFormData,
  GuestType,
  InvitationStatus,
  GUEST_TYPE_CONFIG,
  INVITATION_STATUS_CONFIG,
} from '@/types/guest';

const GUEST_TYPES: GuestType[] = ['adult', 'child', 'vendor', 'staff'];
const INVITATION_STATUSES: InvitationStatus[] = ['pending', 'invited', 'confirmed', 'declined'];

export function BasicInfoTab() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<GuestEditFormData>();

  const guestType = watch('guest_type');
  const invitationStatus = watch('invitation_status');
  const hasPlusOne = watch('has_plus_one');
  const plusOneConfirmed = watch('plus_one_confirmed');

  return (
    <div className="p-4">
      {/* Two-column layout on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Primary Guest Column */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">Primary Guest</h3>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Guest name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="guest@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+1 (555) 123-4567"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Guest Type */}
          <div className="space-y-2">
            <Label htmlFor="guest_type">Guest Type</Label>
            <Select
              value={guestType}
              onValueChange={(value) => setValue('guest_type', value as GuestType, { shouldDirty: true })}
            >
              <SelectTrigger id="guest_type">
                <SelectValue placeholder="Select guest type" />
              </SelectTrigger>
              <SelectContent>
                {GUEST_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {GUEST_TYPE_CONFIG[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invitation Status */}
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
        </div>

        {/* Plus One Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Plus One
            </h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="has_plus_one" className="text-sm text-gray-600">
                {hasPlusOne ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id="has_plus_one"
                checked={hasPlusOne}
                onCheckedChange={(checked) => {
                  setValue('has_plus_one', checked, { shouldDirty: true });
                  // Clear plus one fields when disabled
                  if (!checked) {
                    setValue('plus_one_name', '', { shouldDirty: true });
                    setValue('plus_one_confirmed', false, { shouldDirty: true });
                  }
                }}
              />
            </div>
          </div>

          {hasPlusOne ? (
            <>
              {/* Plus One Name */}
              <div className="space-y-2">
                <Label htmlFor="plus_one_name">
                  Plus One Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="plus_one_name"
                  {...register('plus_one_name')}
                  placeholder="Plus one's name"
                  className={errors.plus_one_name ? 'border-red-500' : ''}
                />
                {errors.plus_one_name && (
                  <p className="text-sm text-red-500">{errors.plus_one_name.message}</p>
                )}
              </div>

              {/* Plus One Confirmed */}
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

              {/* Plus One Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-medium">Plus One Information</p>
                <p className="mt-1 text-blue-600">
                  The plus one will be included in the guest count and seated at the same table as the primary guest.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg text-center">
              <UserPlus className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">
                Enable the toggle above to add a plus one for this guest.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
