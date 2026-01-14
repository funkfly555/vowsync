/**
 * GuestTable - Main table component for guest list
 * @feature 006-guest-list
 * @task T013, T016
 */

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { GuestDisplayItem } from '@/types/guest';
import { GuestRow } from './GuestRow';

interface GuestTableProps {
  guests: GuestDisplayItem[];
  selectedGuests: Set<string>;
  onSelectGuest: (id: string) => void;
  onSelectAll: () => void;
  onEditGuest: (id: string) => void;
  onDeleteGuest: (id: string) => void;
}

export function GuestTable({
  guests,
  selectedGuests,
  onSelectGuest,
  onSelectAll,
  onEditGuest,
  onDeleteGuest,
}: GuestTableProps) {
  const allSelected = guests.length > 0 && selectedGuests.size === guests.length;
  const someSelected = selectedGuests.size > 0 && selectedGuests.size < guests.length;

  return (
    <div className="border border-[#E8E8E8] rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
            {/* Select All Checkbox */}
            <TableHead className="w-[50px] p-4">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) {
                    (ref as HTMLButtonElement).dataset.state = someSelected
                      ? 'indeterminate'
                      : allSelected
                        ? 'checked'
                        : 'unchecked';
                  }
                }}
                onCheckedChange={onSelectAll}
                aria-label="Select all guests"
              />
            </TableHead>
            <TableHead className="p-4 font-semibold text-gray-700">Name</TableHead>
            <TableHead className="p-4 font-semibold text-gray-700">Type</TableHead>
            <TableHead className="p-4 font-semibold text-gray-700">RSVP</TableHead>
            <TableHead className="p-4 font-semibold text-gray-700">Table</TableHead>
            <TableHead className="w-[100px] p-4 font-semibold text-gray-700">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <GuestRow
              key={guest.id}
              guest={guest}
              isSelected={selectedGuests.has(guest.id)}
              onSelect={onSelectGuest}
              onEdit={onEditGuest}
              onDelete={onDeleteGuest}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
