/**
 * PaymentStatusBadge Component
 * @feature 009-vendor-payments-invoices
 * T016: Display payment status with color-coded badge
 *
 * Phase 7B: Dynamic status calculation based on dates
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { getPaymentDisplayStatus } from '@/lib/vendorPaymentStatus';
import type {
  VendorPaymentSchedule,
  PaymentDisplayStatus,
  PaymentStatusBadge as PaymentStatusBadgeType,
} from '@/types/vendor';
import { cn } from '@/lib/utils';

// =============================================================================
// Phase 7B: Dynamic Payment Status Badge
// =============================================================================

interface PaymentScheduleStatusBadgeProps {
  payment: Pick<VendorPaymentSchedule, 'status' | 'due_date' | 'paid_date'>;
  className?: string;
  showIcon?: boolean;
}

const statusIcons: Record<PaymentDisplayStatus, React.ComponentType<{ className?: string }>> = {
  paid: CheckCircle,
  cancelled: XCircle,
  overdue: AlertCircle,
  'due-soon': Clock,
  pending: Clock,
};

/**
 * Displays a payment status badge with appropriate color and icon
 * Status is calculated dynamically based on due_date and paid_date
 */
export function PaymentScheduleStatusBadge({
  payment,
  className,
  showIcon = true,
}: PaymentScheduleStatusBadgeProps) {
  const statusDisplay = getPaymentDisplayStatus(payment);
  const Icon = statusIcons[statusDisplay.status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-medium',
        statusDisplay.bgColor,
        statusDisplay.color,
        'border-transparent',
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{statusDisplay.label}</span>
    </Badge>
  );
}

// =============================================================================
// Legacy: Phase 7A Static Payment Status Badge (for vendor card display)
// =============================================================================

interface PaymentStatusBadgeProps {
  status: PaymentStatusBadgeType;
  className?: string;
}

/**
 * Static badge for vendor card display (Phase 7A legacy)
 * Uses pre-calculated status from calculatePaymentStatus()
 */
export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  // Import config inline to avoid circular dependency
  const config: Record<string, { label: string; color: string; bgColor: string }> = {
    Paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100' },
    Pending: { label: 'Pending', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'Due Soon': { label: 'Due Soon', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    Overdue: { label: 'Overdue', color: 'text-red-700', bgColor: 'bg-red-100' },
  };

  // T009: Defensive null check for status prop
  const statusConfig = config[status?.label] || config['Pending'];

  return (
    <Badge
      variant="secondary"
      className={cn(
        'px-2 py-1 text-xs font-medium',
        statusConfig.bgColor,
        statusConfig.color,
        className
      )}
    >
      {statusConfig.label}
    </Badge>
  );
}
