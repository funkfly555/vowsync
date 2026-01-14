/**
 * RsvpBadge - Color-coded RSVP status badge
 * @feature 006-guest-list
 * @task T010
 */

import { RsvpStatus, RSVP_STATUS_CONFIG } from '@/types/guest';
import { cn } from '@/lib/utils';

interface RsvpBadgeProps {
  status: RsvpStatus;
  className?: string;
}

export function RsvpBadge({ status, className }: RsvpBadgeProps) {
  const config = RSVP_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
