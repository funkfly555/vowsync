/**
 * GuestCardList - Container for mobile guest cards
 * Uses legacy card view for backward compatibility during redesign
 * @feature 006-guest-list
 * @task T028
 */

import { GuestDisplayItem } from '@/types/guest';
import { GuestCardLegacy } from './GuestCardLegacy';

interface GuestCardListProps {
  guests: GuestDisplayItem[];
  onEditGuest: (id: string) => void;
  onDeleteGuest: (id: string) => void;
}

export function GuestCardList({ guests, onEditGuest, onDeleteGuest }: GuestCardListProps) {
  return (
    <div className="space-y-3">
      {guests.map((guest) => (
        <GuestCardLegacy
          key={guest.id}
          guest={guest}
          onEdit={onEditGuest}
          onDelete={onDeleteGuest}
        />
      ))}
    </div>
  );
}
