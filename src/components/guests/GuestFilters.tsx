/**
 * GuestFilters - Container component for search and filter controls
 * @feature 006-guest-list
 * @feature 007-guest-crud-attendance
 * @feature 021-guest-page-redesign
 * @task T021, T038, T040, T059, T062
 *
 * Layout per PRD (05-PAGE-LAYOUTS.md):
 * - Row 1: Full-width search input
 * - Row 2: "Filters:" label + dropdowns (left) | Clear + Export (right)
 */

import { ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { GuestDisplayItem, GuestFilters as GuestFiltersType, GuestType, InvitationStatus } from '@/types/guest';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchInput } from './SearchInput';
import { TypeFilter } from './TypeFilter';
import { InvitationStatusFilter } from './InvitationStatusFilter';
import { EventFilter } from './EventFilter';
import { TableFilter } from './TableFilter';
import { exportToCsv } from '@/lib/export';

interface Event {
  id: string;
  event_name: string;
}

interface GuestFiltersProps {
  filters: GuestFiltersType & { tableNumber?: string };
  onFiltersChange: (filters: Partial<GuestFiltersType & { tableNumber?: string }>) => void;
  events: Event[];
  guests?: GuestDisplayItem[];
  onClearFilters?: () => void;
}

// Check if any filters are active (excluding 'all' values)
function hasActiveFilters(filters: GuestFiltersType & { tableNumber?: string }): boolean {
  return (
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.invitationStatus !== 'all' ||
    (filters.tableNumber !== undefined && filters.tableNumber !== 'all') ||
    filters.eventId !== null
  );
}

export function GuestFilters({ filters, onFiltersChange, events, guests = [], onClearFilters }: GuestFiltersProps) {
  const handleExportCsv = () => {
    if (guests.length === 0) {
      toast.warning('No guests to export');
      return;
    }
    exportToCsv(guests);
    toast.success(`Exported ${guests.length} guests to CSV`);
  };

  const handleExportExcel = () => {
    toast.info('Excel export coming in a future phase');
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFiltersChange({
        search: '',
        type: 'all',
        invitationStatus: 'all',
        tableNumber: 'all',
        eventId: null,
      });
    }
  };

  const showClearButton = hasActiveFilters(filters);

  return (
    <div className="space-y-3">
      {/* Row 1: Full-width search */}
      <SearchInput
        value={filters.search}
        onChange={(search) => onFiltersChange({ search })}
      />

      {/* Row 2: Filters (left) + Clear/Export (right) */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filters:</span>
          <TypeFilter
            value={filters.type}
            onChange={(type: GuestType | 'all') => onFiltersChange({ type })}
          />
          <InvitationStatusFilter
            value={filters.invitationStatus}
            onChange={(invitationStatus: InvitationStatus | 'all') => onFiltersChange({ invitationStatus })}
          />
          <TableFilter
            value={filters.tableNumber || 'all'}
            onChange={(tableNumber) => onFiltersChange({ tableNumber })}
          />
          <EventFilter
            value={filters.eventId}
            onChange={(eventId) => onFiltersChange({ eventId })}
            events={events}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Clear Filters button - only shown when filters are active */}
          {showClearButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 text-gray-600 hover:text-gray-900"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}

          {/* Export dropdown */}
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
    </div>
  );
}
