/**
 * GuestRow - Table row for a single guest
 * @feature 006-guest-list
 * @task T012, T015, T047
 */

import { KeyboardEvent } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { GuestDisplayItem } from '@/types/guest';
import { InvitationStatusBadge } from './InvitationStatusBadge';
import { GuestTypeBadge } from './GuestTypeBadge';

interface GuestRowProps {
  guest: GuestDisplayItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GuestRow({
  guest,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: GuestRowProps) {
  // Keyboard navigation: Space to toggle selection, Enter to edit
  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      onSelect(guest.id);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onEdit(guest.id);
    }
  };

  return (
    <TableRow
      className="hover:bg-[#FAFAFA] transition-colors focus-within:ring-2 focus-within:ring-[#D4A5A5] focus-within:ring-inset"
      data-state={isSelected ? 'selected' : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-selected={isSelected}
    >
      {/* Checkbox */}
      <TableCell className="w-[50px] p-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(guest.id)}
          aria-label={`Select ${guest.name}`}
        />
      </TableCell>

      {/* Name */}
      <TableCell className="p-4 font-medium text-gray-900">{guest.name}</TableCell>

      {/* Type */}
      <TableCell className="p-4">
        <GuestTypeBadge type={guest.guest_type} />
      </TableCell>

      {/* Invitation Status */}
      <TableCell className="p-4">
        <InvitationStatusBadge status={guest.invitation_status} />
      </TableCell>

      {/* Table */}
      <TableCell className="p-4 text-gray-600">
        {guest.table_number || '—'}
      </TableCell>

      {/* Actions */}
      <TableCell className="w-[100px] p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={`Actions for ${guest.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(guest.id)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(guest.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
