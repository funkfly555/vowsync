import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WeddingStatus } from '@/types/wedding';

interface StatusBadgeProps {
  status: WeddingStatus;
  className?: string;
}

const statusConfig: Record<WeddingStatus, { label: string; className: string }> = {
  planning: {
    label: 'Planning',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  completed: {
    label: 'Completed',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
