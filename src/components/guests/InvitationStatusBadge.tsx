/**
 * InvitationStatusBadge - Color-coded invitation status badge
 * @feature 006-guest-list
 * @feature 020-dashboard-settings-fix - Updated to use invitation_status
 */

import { InvitationStatus, INVITATION_STATUS_CONFIG } from '@/types/guest';
import { cn } from '@/lib/utils';

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
  className?: string;
}

export function InvitationStatusBadge({ status, className }: InvitationStatusBadgeProps) {
  const config = INVITATION_STATUS_CONFIG[status];

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
