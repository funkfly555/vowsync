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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  GuestEditFormData,
  GuestType,
  Gender,
  WeddingPartySide,
  WeddingPartyRole,
  GUEST_TYPE_CONFIG,
  GENDER_CONFIG,
  WEDDING_PARTY_SIDE_CONFIG,
  WEDDING_PARTY_ROLES_BY_SIDE,
  WEDDING_PARTY_ROLE_CONFIG,
} from '@/types/guest';

const GUEST_TYPES: GuestType[] = ['adult', 'child', 'vendor', 'staff'];
const GENDERS: Gender[] = ['male', 'female'];
const WEDDING_PARTY_SIDES: WeddingPartySide[] = ['bride', 'groom'];

export function BasicInfoTab() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<GuestEditFormData>();

  const guestType = watch('guest_type');
  const hasPlusOne = watch('has_plus_one');
  // Wedding Party (025-guest-page-fixes)
  const gender = watch('gender');
  const weddingPartySide = watch('wedding_party_side');
  const weddingPartyRole = watch('wedding_party_role');

  // Get available roles based on selected side
  const availableRoles = weddingPartySide ? WEDDING_PARTY_ROLES_BY_SIDE[weddingPartySide] : [];

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

          {/* Gender (025-guest-page-fixes) */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={gender || '_none'}
              onValueChange={(value) => setValue('gender', value === '_none' ? null : value as Gender, { shouldDirty: true })}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {GENDER_CONFIG[g].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wedding Party Side (025-guest-page-fixes) */}
          <div className="space-y-2">
            <Label>Wedding Party Side</Label>
            <RadioGroup
              value={weddingPartySide || ''}
              onValueChange={(value) => {
                const newSide = value ? value as WeddingPartySide : null;
                setValue('wedding_party_side', newSide, { shouldDirty: true });
                // Reset role when side changes (025-guest-page-fixes)
                if (newSide !== weddingPartySide) {
                  setValue('wedding_party_role', null, { shouldDirty: true });
                }
              }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="side_none" />
                <Label htmlFor="side_none" className="font-normal cursor-pointer">None</Label>
              </div>
              {WEDDING_PARTY_SIDES.map((side) => (
                <div key={side} className="flex items-center space-x-2">
                  <RadioGroupItem value={side} id={`side_${side}`} />
                  <Label htmlFor={`side_${side}`} className="font-normal cursor-pointer">
                    {WEDDING_PARTY_SIDE_CONFIG[side].label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Wedding Party Role (025-guest-page-fixes) - Conditional on side */}
          {weddingPartySide && (
            <div className="space-y-2">
              <Label htmlFor="wedding_party_role">Wedding Party Role</Label>
              <Select
                value={weddingPartyRole || '_none'}
                onValueChange={(value) => setValue('wedding_party_role', value === '_none' ? null : value as WeddingPartyRole, { shouldDirty: true })}
              >
                <SelectTrigger id="wedding_party_role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {WEDDING_PARTY_ROLE_CONFIG[role].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
