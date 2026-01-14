/**
 * BulkActionsBar - Bulk action controls when guests are selected
 * @feature 006-guest-list
 * @task T036, T039
 */

import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedCount, onClearSelection }: BulkActionsBarProps) {
  const handleAssignTable = () => {
    toast.info('Coming in Phase 6B');
  };

  const handleSendEmail = () => {
    toast.info('Coming in Phase 6B');
  };

  return (
    <div className="flex items-center justify-between bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          Selected: {selectedCount}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Assign Table
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleAssignTable}>
              Select table...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
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
