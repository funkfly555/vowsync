/**
 * EventFilter - Dropdown filter for events
 * @feature 006-guest-list
 * @task T020
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Event {
  id: string;
  event_name: string;
}

interface EventFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
  events: Event[];
}

export function EventFilter({ value, onChange, events }: EventFilterProps) {
  return (
    <Select
      value={value ?? 'all'}
      onValueChange={(v) => onChange(v === 'all' ? null : v)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Event" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Events</SelectItem>
        {events.map((event) => (
          <SelectItem key={event.id} value={event.id}>
            {event.event_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
