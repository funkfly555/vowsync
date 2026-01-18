/**
 * InvitationStatusFilter - Dropdown filter for invitation status
 * @feature 006-guest-list
 * @feature 020-dashboard-settings-fix - Updated to use invitation_status
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvitationStatus, INVITATION_STATUS_CONFIG } from '@/types/guest';

interface InvitationStatusFilterProps {
  value: InvitationStatus | 'all';
  onChange: (value: InvitationStatus | 'all') => void;
}

export function InvitationStatusFilter({ value, onChange }: InvitationStatusFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as InvitationStatus | 'all')}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        {(Object.keys(INVITATION_STATUS_CONFIG) as InvitationStatus[]).map((status) => (
          <SelectItem key={status} value={status}>
            {INVITATION_STATUS_CONFIG[status].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
