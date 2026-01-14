/**
 * GuestBasicInfoTab - Tab 1: Basic Information
 * @feature 007-guest-crud-attendance
 *
 * Fields: Name, Email, Phone, Type, Invitation Status, Attendance Confirmed
 */

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

const INVITATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'invited', label: 'Invited' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
];

export function GuestBasicInfoTab({ form }: GuestBasicInfoTabProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const guestType = watch('guest_type');
  const invitationStatus = watch('invitation_status');
  const attendanceConfirmed = watch('attendance_confirmed');

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

      {/* Invitation Status */}
      <div className="space-y-2">
        <Label htmlFor="invitation_status">Invitation Status</Label>
        <Select
          value={invitationStatus}
          onValueChange={(value) =>
            setValue('invitation_status', value as GuestFormData['invitation_status'])
          }
        >
          <SelectTrigger id="invitation_status">
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

      {/* Attendance Confirmed */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="attendance_confirmed"
          checked={attendanceConfirmed}
          onCheckedChange={(checked) =>
            setValue('attendance_confirmed', checked === true)
          }
        />
        <Label htmlFor="attendance_confirmed" className="cursor-pointer">
          Attendance Confirmed
        </Label>
      </div>
    </div>
  );
}
