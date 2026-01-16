/**
 * RepurposingFilters Component
 * @feature 014-repurposing-timeline
 * @task T018
 *
 * Filter controls for repurposing list
 */

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type {
  RepurposingFilters as Filters,
  RepurposingInstructionWithRelations,
} from '@/types/repurposing';
import { STATUS_LABELS } from '@/types/repurposing';

interface EventOption {
  id: string;
  event_name: string;
}

interface ItemOption {
  id: string;
  description: string;
}

interface RepurposingFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  instructions: RepurposingInstructionWithRelations[];
  events: EventOption[];
  items: ItemOption[];
}

export function RepurposingFilters({
  filters,
  onFilterChange,
  instructions,
  events,
  items,
}: RepurposingFiltersProps) {
  // Extract unique responsible parties from instructions
  const responsibleParties = useMemo(() => {
    const parties = new Set<string>();
    instructions.forEach((inst) => {
      if (inst.responsible_party) {
        parties.add(inst.responsible_party);
      }
    });
    return Array.from(parties).sort();
  }, [instructions]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.responsibleParty !== 'all' ||
    filters.eventId !== 'all' ||
    filters.itemId !== 'all';

  // Reset all filters
  const resetFilters = () => {
    onFilterChange({
      status: 'all',
      responsibleParty: 'all',
      eventId: 'all',
      itemId: 'all',
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-lg">
      {/* Status Filter */}
      <div className="space-y-1.5 min-w-[140px]">
        <Label htmlFor="status-filter" className="text-sm">
          Status
        </Label>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFilterChange({ ...filters, status: value as Filters['status'] })
          }
        >
          <SelectTrigger id="status-filter" className="min-h-[44px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Responsible Party Filter */}
      <div className="space-y-1.5 min-w-[160px]">
        <Label htmlFor="party-filter" className="text-sm">
          Responsible Party
        </Label>
        <Select
          value={filters.responsibleParty}
          onValueChange={(value) =>
            onFilterChange({ ...filters, responsibleParty: value })
          }
        >
          <SelectTrigger id="party-filter" className="min-h-[44px]">
            <SelectValue placeholder="All parties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parties</SelectItem>
            {responsibleParties.map((party) => (
              <SelectItem key={party} value={party}>
                {party}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Event Filter */}
      <div className="space-y-1.5 min-w-[160px]">
        <Label htmlFor="event-filter" className="text-sm">
          Event
        </Label>
        <Select
          value={filters.eventId}
          onValueChange={(value) =>
            onFilterChange({ ...filters, eventId: value })
          }
        >
          <SelectTrigger id="event-filter" className="min-h-[44px]">
            <SelectValue placeholder="All events" />
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
      </div>

      {/* Item Filter */}
      <div className="space-y-1.5 min-w-[180px]">
        <Label htmlFor="item-filter" className="text-sm">
          Item
        </Label>
        <Select
          value={filters.itemId}
          onValueChange={(value) =>
            onFilterChange({ ...filters, itemId: value })
          }
        >
          <SelectTrigger id="item-filter" className="min-h-[44px]">
            <SelectValue placeholder="All items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="min-h-[44px] text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

/**
 * Apply filters to instructions list (client-side filtering)
 */
export function filterInstructions(
  instructions: RepurposingInstructionWithRelations[],
  filters: Filters
): RepurposingInstructionWithRelations[] {
  return instructions.filter((instruction) => {
    // Status filter
    if (filters.status !== 'all' && instruction.status !== filters.status) {
      return false;
    }

    // Responsible party filter
    if (
      filters.responsibleParty !== 'all' &&
      instruction.responsible_party !== filters.responsibleParty
    ) {
      return false;
    }

    // Event filter (matches either from_event OR to_event)
    if (
      filters.eventId !== 'all' &&
      instruction.from_event_id !== filters.eventId &&
      instruction.to_event_id !== filters.eventId
    ) {
      return false;
    }

    // Item filter
    if (
      filters.itemId !== 'all' &&
      instruction.wedding_item_id !== filters.itemId
    ) {
      return false;
    }

    return true;
  });
}
