/**
 * ContractStatusBadge Component
 * @feature 008-vendor-management
 * @task T011
 *
 * Displays contract status with appropriate color coding (FR-012)
 */

import { Badge } from '@/components/ui/badge';
import { ContractStatusBadge as ContractStatusBadgeType, CONTRACT_STATUS_CONFIG } from '@/types/vendor';
import { cn } from '@/lib/utils';

interface ContractStatusBadgeProps {
  status: ContractStatusBadgeType;
  className?: string;
}

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  const config = CONTRACT_STATUS_CONFIG[status.label];

  return (
    <Badge
      variant="secondary"
      className={cn(
        'px-2 py-1 text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
