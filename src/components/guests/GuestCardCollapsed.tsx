/**
 * GuestCardCollapsed - Collapsed card view with horizontal layout
 * All data columns on same line as guest name (flexbox, not grid)
 * @feature 021-guest-page-redesign
 * @task T008, T011-T013
 */

import { ChevronRight, ChevronDown, MoreVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { InvitationStatusBadge } from './InvitationStatusBadge';
import { GuestCardDisplayItem } from '@/types/guest';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface GuestCardCollapsedProps {
  guest: GuestCardDisplayItem;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
}

export function GuestCardCollapsed({
  guest,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
}: GuestCardCollapsedProps) {
  // Only stop propagation - don't call onToggleSelect here
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onToggleExpand();
    } else if (e.key === ' ') {
      e.preventDefault();
      onToggleSelect();
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Format table and seat display
  const tableDisplay = guest.table_number
    ? guest.table_position
      ? `Table ${guest.table_number}, Seat ${guest.table_position}`
      : `Table ${guest.table_number}`
    : '—';

  // Format events display
  const eventsDisplay =
    guest.totalEventsCount > 0
      ? `${guest.attendingEventsCount} of ${guest.totalEventsCount}`
      : '—';

  // Capitalize guest type for display
  const guestTypeDisplay = guest.guest_type.charAt(0).toUpperCase() + guest.guest_type.slice(1);

  return (
    <div
      className={cn(
        'border-b border-gray-200 px-6 py-4 cursor-pointer transition-colors',
        isSelected ? 'bg-rose-50' : 'hover:bg-gray-50'
      )}
      onClick={onToggleExpand}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${guest.name}, ${isExpanded ? 'collapse' : 'expand'} details`}
    >
      {/* SINGLE ROW - Everything horizontal */}
      <div className="flex items-center gap-4">

        {/* Left: Checkbox + Arrow + Name */}
        <div className="flex items-center gap-3 min-w-[250px]">
          <div onClick={handleCheckboxClick} className="flex-shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect()}
              aria-label={`Select ${guest.name}`}
              className="border-2 data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
            />
          </div>

          <div className="flex-shrink-0 text-gray-400">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1">
            {/* Guest Name */}
            <div className="text-base font-medium text-gray-900">{guest.name}</div>

            {/* Plus One - Below name, aligned left */}
            {guest.has_plus_one && guest.plus_one_name && (
              <div className="text-sm text-gray-500 italic">
                + {guest.plus_one_name} (Plus One)
              </div>
            )}
          </div>
        </div>

        {/* Type Column - Same row */}
        <div className="min-w-[100px]">
          <div className="text-xs text-gray-500 uppercase">Type</div>
          <div className="text-sm text-gray-900">{guestTypeDisplay}</div>
        </div>

        {/* RSVP Column - Same row */}
        <div className="min-w-[120px]">
          <div className="text-xs text-gray-500 uppercase">RSVP</div>
          <InvitationStatusBadge status={guest.invitation_status} />
        </div>

        {/* Table Column - Same row */}
        <div className="min-w-[150px]">
          <div className="text-xs text-gray-500 uppercase">Table</div>
          <div className="text-sm text-gray-900">{tableDisplay}</div>
        </div>

        {/* Events Column - Same row */}
        <div className="min-w-[100px]">
          <div className="text-xs text-gray-500 uppercase">Events</div>
          <div className="text-sm text-gray-900">{eventsDisplay}</div>
        </div>

        {/* Right: Menu - Same row */}
        <div className="ml-auto flex-shrink-0" onClick={handleMenuClick}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onToggleExpand}>
                {isExpanded ? 'Collapse' : 'Expand'} Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleSelect}>
                {isSelected ? 'Deselect' : 'Select'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </div>
  );
}
