/**
 * RsvpFilter - Dropdown filter for RSVP status
 * @feature 006-guest-list
 * @task T019
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RsvpStatus, RSVP_STATUS_CONFIG } from '@/types/guest';

interface RsvpFilterProps {
  value: RsvpStatus | 'all';
  onChange: (value: RsvpStatus | 'all') => void;
}

export function RsvpFilter({ value, onChange }: RsvpFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as RsvpStatus | 'all')}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="RSVP" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All RSVP</SelectItem>
        {(Object.keys(RSVP_STATUS_CONFIG) as RsvpStatus[]).map((status) => (
          <SelectItem key={status} value={status}>
            {RSVP_STATUS_CONFIG[status].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
