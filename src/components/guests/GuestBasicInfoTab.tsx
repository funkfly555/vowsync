/**
 * GuestBasicInfoTab - Tab 1: Basic Information
 * @feature 007-guest-crud-attendance
 * @feature 020-dashboard-settings-fix - Moved Invitation Status to RSVP tab
 * @feature 025-guest-page-fixes - Added Gender, Wedding Party Side, Wedding Party Role
 *
 * Fields: Name, Email, Phone, Type, Gender, Wedding Party Side, Wedding Party Role
 */

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GuestFormData,
  GUEST_TYPE_CONFIG,
  GENDER_CONFIG,
  WEDDING_PARTY_SIDE_CONFIG,
  WEDDING_PARTY_ROLES_BY_SIDE,
  WEDDING_PARTY_ROLE_CONFIG,
  Gender,
  WeddingPartySide,
  WeddingPartyRole,
} from '@/types/guest';

interface GuestBasicInfoTabProps {
  form: UseFormReturn<GuestFormData>;
}

export function GuestBasicInfoTab({ form }: GuestBasicInfoTabProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const guestType = watch('guest_type');
  const gender = watch('gender');
  const weddingPartySide = watch('wedding_party_side');
  const weddingPartyRole = watch('wedding_party_role');

  // Get available roles based on selected side
  const availableRoles = weddingPartySide
    ? WEDDING_PARTY_ROLES_BY_SIDE[weddingPartySide]
    : [];

  // Handle side change - reset role if not valid for new side
  const handleSideChange = (value: string) => {
    const newSide = value === '__none__' ? null : (value as WeddingPartySide);
    setValue('wedding_party_side', newSide);

    // Reset role if current role is not valid for new side
    if (newSide && weddingPartyRole) {
      const validRoles = WEDDING_PARTY_ROLES_BY_SIDE[newSide];
      if (!validRoles.includes(weddingPartyRole)) {
        setValue('wedding_party_role', null);
      }
    } else if (!newSide) {
      setValue('wedding_party_role', null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter guest name"
          aria-invalid={!!errors.name}
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
          placeholder="Enter email address"
          aria-invalid={!!errors.email}
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
          placeholder="Enter phone number"
          aria-invalid={!!errors.phone}
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
          onValueChange={(value) =>
            setValue('guest_type', value as GuestFormData['guest_type'])
          }
        >
          <SelectTrigger id="guest_type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GUEST_TYPE_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender (025-guest-page-fixes) */}
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select
          value={gender ?? '__none__'}
          onValueChange={(value) =>
            setValue('gender', value === '__none__' ? null : (value as Gender))
          }
        >
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Not specified</SelectItem>
            {Object.entries(GENDER_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Wedding Party Side (025-guest-page-fixes) */}
      <div className="space-y-2">
        <Label htmlFor="wedding_party_side">Wedding Party Side</Label>
        <Select
          value={weddingPartySide ?? '__none__'}
          onValueChange={handleSideChange}
        >
          <SelectTrigger id="wedding_party_side">
            <SelectValue placeholder="Select side" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Not in wedding party</SelectItem>
            {Object.entries(WEDDING_PARTY_SIDE_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Wedding Party Role (025-guest-page-fixes) - Only show if side is selected */}
      {weddingPartySide && (
        <div className="space-y-2">
          <Label htmlFor="wedding_party_role">Wedding Party Role</Label>
          <Select
            value={weddingPartyRole ?? '__none__'}
            onValueChange={(value) =>
              setValue('wedding_party_role', value === '__none__' ? null : (value as WeddingPartyRole))
            }
          >
            <SelectTrigger id="wedding_party_role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No specific role</SelectItem>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {WEDDING_PARTY_ROLE_CONFIG[role].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.wedding_party_role && (
            <p className="text-sm text-red-500">{errors.wedding_party_role.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
