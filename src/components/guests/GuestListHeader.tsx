/**
 * GuestListHeader - Column labels header for the guest list
 * Shows column labels that align with GuestCardCollapsed layout
 * @feature 021-guest-page-redesign
 */

import { Checkbox } from '@/components/ui/checkbox';

interface GuestListHeaderProps {
  allSelected: boolean;
  someSelected: boolean;
  onToggleSelectAll: () => void;
}

export function GuestListHeader({
  allSelected,
  someSelected,
  onToggleSelectAll,
}: GuestListHeaderProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-gray-100 border border-gray-200 rounded-t-lg text-xs font-medium text-gray-500 uppercase tracking-wider">
      {/* Select all checkbox */}
      <div className="flex-shrink-0">
        {someSelected && !allSelected ? (
          <div
            className="h-4 w-4 border-2 border-primary bg-primary/20 rounded flex items-center justify-center cursor-pointer"
            onClick={onToggleSelectAll}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onToggleSelectAll()}
          >
            <div className="h-2 w-2 bg-primary rounded-sm" />
          </div>
        ) : (
          <Checkbox
            checked={allSelected}
            onCheckedChange={onToggleSelectAll}
            aria-label={allSelected ? 'Deselect all guests' : 'Select all guests'}
          />
        )}
      </div>

      {/* Expand placeholder */}
      <div className="flex-shrink-0 w-5" />

      {/* Name column */}
      <div className="flex-1 min-w-0 sm:w-[180px] sm:flex-none">Name</div>

      {/* Type column - hidden on mobile */}
      <div className="hidden sm:block w-[80px] flex-shrink-0">Type</div>

      {/* RSVP column - hidden on mobile */}
      <div className="hidden sm:block w-[100px] flex-shrink-0">RSVP</div>

      {/* Table column - hidden on mobile */}
      <div className="hidden md:block w-[140px] flex-shrink-0">Table</div>

      {/* Events column - hidden on mobile */}
      <div className="hidden lg:block w-[70px] flex-shrink-0 text-center">Events</div>

      {/* Mobile label */}
      <div className="sm:hidden flex-shrink-0">Status</div>

      {/* Actions placeholder */}
      <div className="flex-shrink-0 w-8" />
    </div>
  );
}
