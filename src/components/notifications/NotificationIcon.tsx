/**
 * NotificationIcon Component - Type-specific icon with color
 * @feature 018-notifications
 * @task T006
 */

import {
  Bell,
  PiggyBank,
  CheckSquare,
  Users,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/notification';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/notification';

// =============================================================================
// Props Interface
// =============================================================================

interface NotificationIconProps {
  /** Notification type for icon selection */
  type: NotificationType;
  /** Optional size class override */
  className?: string;
}

// =============================================================================
// Icon Mapping
// =============================================================================

const iconMap = {
  PiggyBank,
  CheckSquare,
  Users,
  Briefcase,
  AlertTriangle,
  Bell,
} as const;

// =============================================================================
// Component
// =============================================================================

/**
 * Renders the appropriate icon for a notification type with the correct color
 */
export function NotificationIcon({ type, className }: NotificationIconProps) {
  const config = NOTIFICATION_TYPE_CONFIG[type];
  const iconName = config?.icon || 'Bell';
  const colorClass = config?.color || 'text-gray-500';

  // Get the icon component
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Bell;

  return (
    <IconComponent
      className={cn('h-5 w-5', colorClass, className)}
      aria-hidden="true"
    />
  );
}
