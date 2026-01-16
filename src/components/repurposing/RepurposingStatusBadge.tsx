/**
 * RepurposingStatusBadge Component
 * @feature 014-repurposing-timeline
 * @task T008
 *
 * Status badge with colors:
 * - pending: blue-100/blue-800
 * - in_progress: orange-100/orange-800
 * - completed: green-100/green-800
 * - issue: red-100/red-800
 */

import { cn } from '@/lib/utils';
import type { RepurposingStatus } from '@/types/repurposing';
import { STATUS_COLORS, STATUS_LABELS } from '@/types/repurposing';

interface RepurposingStatusBadgeProps {
  status: RepurposingStatus;
  className?: string;
  size?: 'sm' | 'default';
}

export function RepurposingStatusBadge({
  status,
  className,
  size = 'default',
}: RepurposingStatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
