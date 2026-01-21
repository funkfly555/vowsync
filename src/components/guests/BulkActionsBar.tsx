/**
 * BulkActionsBar - Always-visible bulk action controls for guest management
 * Shows informational state when no guests selected, active state when selected
 * Includes: Select All, Clear Selection, Assign Table, Export CSV, Send Email
 * @feature 006-guest-list
 * @feature 007-guest-crud-attendance
 * @feature 021-guest-page-redesign
 * @task T040, T041, T044, T045, T046
 */

import { X, Loader2, Info, Download, CheckSquare, Square, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { TABLE_NUMBERS } from '@/types/guest';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  someSelected: boolean;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onAssignTable?: (tableNumber: string | null) => void;
  onAssignSeats?: () => void;
  onExportSelected?: () => void;
  onExportAll?: () => void;
  onSendEmail?: () => void;
  onDeleteSelected?: () => void; // 025-guest-page-fixes
  isAssigning?: boolean;
  isDeleting?: boolean; // 025-guest-page-fixes
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  allSelected,
  someSelected,
  onClearSelection,
  onSelectAll,
  onAssignTable,
  onAssignSeats,
  onExportSelected,
  onExportAll,
  onSendEmail,
  onDeleteSelected,
  isAssigning = false,
  isDeleting = false,
}: BulkActionsBarProps) {
  const hasSelection = selectedCount > 0;
  const isDisabled = !hasSelection || isAssigning || isDeleting;

  const handleAssignTable = (tableNumber: string | null) => {
    if (onAssignTable) {
      onAssignTable(tableNumber);
    } else {
      toast.info('Table assignment coming soon');
    }
  };

  const handleAssignSeats = () => {
    if (onAssignSeats) {
      onAssignSeats();
    } else {
      toast.info('Visual seat assignment coming soon');
    }
  };

  const handleSendEmail = () => {
    if (onSendEmail) {
      onSendEmail();
    } else {
      toast.info('Email functionality coming in a future phase');
    }
  };

  const handleExportSelected = () => {
    if (onExportSelected) {
      onExportSelected();
      toast.success(`Exported ${selectedCount} guests to CSV`);
    }
  };

  const handleExportAll = () => {
    if (onExportAll) {
      onExportAll();
      toast.success(`Exported all ${totalCount} guests to CSV`);
    }
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  return (
    <div
      className={`sticky top-0 z-10 flex items-center justify-between rounded-lg px-4 py-3 shadow-sm transition-colors ${
        hasSelection
          ? 'bg-rose-50 border-2 border-[#D4A5A5] shadow-md'
          : 'bg-slate-50 border border-slate-200'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Select All Checkbox */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleToggleSelectAll}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleToggleSelectAll()}
        >
          {someSelected ? (
            <div className="h-4 w-4 border-2 border-[#D4A5A5] bg-[#D4A5A5]/20 rounded flex items-center justify-center">
              <div className="h-2 w-2 bg-[#D4A5A5] rounded-sm" />
            </div>
          ) : (
            <Checkbox
              checked={allSelected}
              aria-label={allSelected ? 'Deselect all guests' : 'Select all guests'}
              className="data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
            />
          )}
          <span className="text-sm text-gray-600">
            {allSelected ? 'Deselect All' : 'Select All'}
          </span>
        </div>

        {hasSelection ? (
          <>
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} of {totalCount} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8"
              disabled={isAssigning}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </>
        ) : (
          <span className="text-sm text-slate-500 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Select guests to assign tables, export, or send emails
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleExportSelected}
              disabled={!hasSelection}
              className={!hasSelection ? 'text-gray-400' : ''}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Export Selected ({selectedCount})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportAll}>
              <Square className="h-4 w-4 mr-2" />
              Export All ({totalCount})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Assign Seats (Visual) Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={handleAssignSeats}
        >
          <Users className="h-4 w-4 mr-2" />
          Assign Seats
        </Button>

        {/* Assign Table Dropdown (Quick) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDisabled}>
              {isAssigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Quick Table
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
            {TABLE_NUMBERS.map((tableNum) => (
              <DropdownMenuItem
                key={tableNum}
                onClick={() => handleAssignTable(tableNum)}
              >
                Table {tableNum}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAssignTable(null)}
              className="text-gray-500"
            >
              Clear Table Assignment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Send Email Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDisabled}>
              Send Email
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSendEmail}>
              Send invitation email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSendEmail}>
              Send reminder email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Selected Button (025-guest-page-fixes) */}
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={onDeleteSelected}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
        >
          {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Trash2 className="h-4 w-4 mr-2" />
          Delete ({selectedCount})
        </Button>
      </div>
    </div>
  );
}
