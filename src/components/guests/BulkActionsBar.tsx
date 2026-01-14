/**
 * BulkActionsBar - Always-visible bulk action controls for guest management
 * Shows informational state when no guests selected, active state when selected
 * @feature 006-guest-list
 * @feature 007-guest-crud-attendance
 */

import { X, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TABLE_NUMBERS } from '@/types/guest';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAssignTable?: (tableNumber: string | null) => void;
  onSendEmail?: () => void;
  isAssigning?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onAssignTable,
  onSendEmail,
  isAssigning = false,
}: BulkActionsBarProps) {
  const hasSelection = selectedCount > 0;
  const isDisabled = !hasSelection || isAssigning;

  const handleAssignTable = (tableNumber: string | null) => {
    if (onAssignTable) {
      onAssignTable(tableNumber);
    } else {
      toast.info('Table assignment coming soon');
    }
  };

  const handleSendEmail = () => {
    if (onSendEmail) {
      onSendEmail();
    } else {
      toast.info('Email functionality coming in a future phase');
    }
  };

  return (
    <div
      className={`sticky top-0 z-10 flex items-center justify-between rounded-lg px-4 py-3 shadow-sm transition-colors ${
        hasSelection
          ? 'bg-blue-50 border-2 border-blue-200 shadow-md'
          : 'bg-slate-50 border border-slate-200'
      }`}
    >
      <div className="flex items-center gap-4">
        {hasSelection ? (
          <>
            <span className="text-sm font-medium text-gray-700">
              Selected: {selectedCount} guest{selectedCount !== 1 ? 's' : ''}
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
            Select guests to assign tables or send emails
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDisabled}>
              {isAssigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign Table
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
      </div>
    </div>
  );
}
