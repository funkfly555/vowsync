/**
 * GuestCardLegacy - Legacy mobile card view for a single guest
 * Kept for backward compatibility during phase 021 redesign
 * @feature 006-guest-list
 * @task T027, T030
 */

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GuestDisplayItem } from '@/types/guest';
import { InvitationStatusBadge } from './InvitationStatusBadge';
import { GuestTypeBadge } from './GuestTypeBadge';

interface GuestCardProps {
  guest: GuestDisplayItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GuestCardLegacy({ guest, onEdit, onDelete }: GuestCardProps) {
  return (
    <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{guest.name}</h3>
          <div className="flex gap-2 mt-1">
            <GuestTypeBadge type={guest.guest_type} />
            <InvitationStatusBadge status={guest.invitation_status} />
          </div>
        </div>
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
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-medium">Table: </span>
        {guest.table_number || '—'}
      </div>
    </div>
  );
}
