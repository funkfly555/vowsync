/**
 * InvoiceStatusBadge Component
 * @feature 009-vendor-payments-invoices
 * T032: Display invoice status with color-coded badge
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, FileText } from 'lucide-react';
import { getInvoiceDisplayStatus } from '@/lib/vendorInvoiceStatus';
import type { VendorInvoice, InvoiceDisplayStatus } from '@/types/vendor';
import { cn } from '@/lib/utils';

interface InvoiceStatusBadgeProps {
  invoice: Pick<VendorInvoice, 'status' | 'due_date' | 'paid_date'>;
  className?: string;
  showIcon?: boolean;
}

const statusIcons: Record<InvoiceDisplayStatus, React.ComponentType<{ className?: string }>> = {
  paid: CheckCircle,
  cancelled: XCircle,
  overdue: AlertCircle,
  partial: Clock,
  unpaid: FileText,
};

/**
 * Displays an invoice status badge with appropriate color and icon
 * Status is calculated dynamically based on due_date and paid_date
 */
export function InvoiceStatusBadge({
  invoice,
  className,
  showIcon = true,
}: InvoiceStatusBadgeProps) {
  const statusDisplay = getInvoiceDisplayStatus(invoice);
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

export default InvoiceStatusBadge;
