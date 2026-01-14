/**
 * TypeFilter - Dropdown filter for guest types
 * @feature 006-guest-list
 * @task T018
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GuestType, GUEST_TYPE_CONFIG } from '@/types/guest';

interface TypeFilterProps {
  value: GuestType | 'all';
  onChange: (value: GuestType | 'all') => void;
}

export function TypeFilter({ value, onChange }: TypeFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as GuestType | 'all')}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Types</SelectItem>
        {(Object.keys(GUEST_TYPE_CONFIG) as GuestType[]).map((type) => (
          <SelectItem key={type} value={type}>
            {GUEST_TYPE_CONFIG[type].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
