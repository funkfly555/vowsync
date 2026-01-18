/**
 * GuestBasicInfoTab - Tab 1: Basic Information
 * @feature 007-guest-crud-attendance
 * @feature 020-dashboard-settings-fix - Moved Invitation Status to RSVP tab
 *
 * Fields: Name, Email, Phone, Type
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
import { GuestFormData, GUEST_TYPE_CONFIG } from '@/types/guest';

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
    </div>
  );
}
