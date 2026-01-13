import { WeddingCard } from './WeddingCard';
import type { Wedding } from '@/types/wedding';

interface WeddingListProps {
  weddings: Wedding[];
  onDeleteClick: (wedding: Wedding) => void;
}

export function WeddingList({ weddings, onDeleteClick }: WeddingListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {weddings.map((wedding) => (
        <WeddingCard
          key={wedding.id}
          wedding={wedding}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
}
