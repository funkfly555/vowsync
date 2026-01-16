/**
 * AvailabilityStatusBadge - Badge component displaying availability status
 * @feature 013-wedding-items
 * @task T013
 */

import { Check, AlertTriangle, HelpCircle } from 'lucide-react';
import type { AvailabilityStatus, AvailabilityStatusType } from '@/types/weddingItem';
import { checkAvailability } from '@/types/weddingItem';

interface AvailabilityStatusBadgeProps {
  status: AvailabilityStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Get the configuration for each availability status type
 */
function getStatusConfig(status: AvailabilityStatusType) {
  switch (status) {
    case 'sufficient':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        Icon: Check,
      };
    case 'shortage':
      return {
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        Icon: AlertTriangle,
      };
    case 'unknown':
    default:
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        Icon: HelpCircle,
      };
  }
}

/**
 * Badge displaying the availability status with appropriate styling
 * - Sufficient: Green badge with checkmark
 * - Shortage: Orange badge with warning icon
 * - Unknown: Gray badge with question mark
 */
export function AvailabilityStatusBadge({
  status,
  showIcon = true,
  size = 'sm',
}: AvailabilityStatusBadgeProps) {
  const config = getStatusConfig(status.status);
  const { bgColor, textColor, Icon } = config;

  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`${baseClasses} ${sizeClasses} ${bgColor} ${textColor}`}>
      {showIcon && <Icon size={iconSize} />}
      <span>{status.message}</span>
    </span>
  );
}

/**
 * Convenience component that calculates status from totalRequired and numberAvailable
 */
interface AvailabilityStatusFromValuesProps {
  totalRequired: number;
  numberAvailable: number | null;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function AvailabilityStatusFromValues({
  totalRequired,
  numberAvailable,
  showIcon = true,
  size = 'sm',
}: AvailabilityStatusFromValuesProps) {
  const status = checkAvailability(totalRequired, numberAvailable);
  return <AvailabilityStatusBadge status={status} showIcon={showIcon} size={size} />;
}
