import { Clock } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface DurationDisplayProps {
  hours: number | null;
  className?: string;
}

export function DurationDisplay({ hours, className = '' }: DurationDisplayProps) {
  return (
    <div className={`flex items-center gap-1 text-xs sm:text-sm text-muted-foreground ${className}`}>
      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
      <span>{formatDuration(hours)}</span>
    </div>
  );
}
