/**
 * PaymentStatusBadge Component
 * @feature 008-vendor-management
 * @task T012
 *
 * Displays payment status with appropriate color coding (FR-013)
 * Phase 7A: Always shows 'Pending' placeholder
 * Phase 7B: Will show actual status based on payment schedule
 */

import { Badge } from '@/components/ui/badge';
import { PaymentStatusBadge as PaymentStatusBadgeType, PAYMENT_STATUS_CONFIG } from '@/types/vendor';
import { cn } from '@/lib/utils';

interface PaymentStatusBadgeProps {
  status: PaymentStatusBadgeType;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status.label];

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
