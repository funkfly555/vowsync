/**
 * GuestCardList - Container for mobile guest cards
 * @feature 006-guest-list
 * @task T028
 */

import { GuestDisplayItem } from '@/types/guest';
import { GuestCard } from './GuestCard';

interface GuestCardListProps {
  guests: GuestDisplayItem[];
  onEditGuest: (id: string) => void;
  onDeleteGuest: (id: string) => void;
}

export function GuestCardList({ guests, onEditGuest, onDeleteGuest }: GuestCardListProps) {
  return (
    <div className="space-y-3">
      {guests.map((guest) => (
        <GuestCard
          key={guest.id}
          guest={guest}
          onEdit={onEditGuest}
          onDelete={onDeleteGuest}
        />
      ))}
    </div>
  );
}
