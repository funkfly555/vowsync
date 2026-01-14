/**
 * GuestFilters - Container component for search and filter controls
 * @feature 006-guest-list
 * @task T021
 *
 * Layout per PRD (05-PAGE-LAYOUTS.md):
 * - Row 1: Full-width search input
 * - Row 2: "Filters:" label + 3 dropdowns (left) | Export dropdown (right)
 */

import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { GuestFilters as GuestFiltersType, GuestType, RsvpStatus } from '@/types/guest';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchInput } from './SearchInput';
import { TypeFilter } from './TypeFilter';
import { RsvpFilter } from './RsvpFilter';
import { EventFilter } from './EventFilter';

interface Event {
  id: string;
  event_name: string;
}

interface GuestFiltersProps {
  filters: GuestFiltersType;
  onFiltersChange: (filters: Partial<GuestFiltersType>) => void;
  events: Event[];
}

export function GuestFilters({ filters, onFiltersChange, events }: GuestFiltersProps) {
  const handleExportCsv = () => {
    toast.info('Coming in Phase 6B');
  };

  const handleExportExcel = () => {
    toast.info('Coming in Phase 6B');
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Full-width search */}
      <SearchInput
        value={filters.search}
        onChange={(search) => onFiltersChange({ search })}
      />

      {/* Row 2: Filters (left) + Export (right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filters:</span>
          <TypeFilter
            value={filters.type}
            onChange={(type: GuestType | 'all') => onFiltersChange({ type })}
          />
          <RsvpFilter
            value={filters.rsvpStatus}
            onChange={(rsvpStatus: RsvpStatus | 'all') => onFiltersChange({ rsvpStatus })}
          />
          <EventFilter
            value={filters.eventId}
            onChange={(eventId) => onFiltersChange({ eventId })}
            events={events}
          />
        </div>

        {/* Export dropdown on the right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4 border-[#E8E8E8] bg-white rounded-md"
            >
              Export
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCsv}>
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>
              Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
