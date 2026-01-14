/**
 * GuestTypeBadge - Guest type indicator badge
 * @feature 006-guest-list
 * @task T011
 */

import { GuestType, GUEST_TYPE_CONFIG } from '@/types/guest';
import { cn } from '@/lib/utils';

interface GuestTypeBadgeProps {
  type: GuestType;
  className?: string;
}

export function GuestTypeBadge({ type, className }: GuestTypeBadgeProps) {
  const config = GUEST_TYPE_CONFIG[type];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        'bg-gray-100 text-gray-700',
        className
      )}
    >
      {config.label}
    </span>
  );
}
