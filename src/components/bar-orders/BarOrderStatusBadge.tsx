/**
 * BarOrderStatusBadge - Status badge component with color mappings
 * @feature 012-bar-order-management
 * @task T012
 */

import { Badge } from '@/components/ui/badge';
import {
  FileEdit,
  CheckCircle,
  ShoppingCart,
  PackageCheck,
} from 'lucide-react';
import type { BarOrderStatus } from '@/types/barOrder';
import {
  getBarOrderStatusBadge,
  getBarOrderBadgeVariant,
} from '@/lib/barOrderStatus';

interface BarOrderStatusBadgeProps {
  status: BarOrderStatus;
  showIcon?: boolean;
  className?: string;
}

/**
 * Get icon component for status
 */
function getStatusIcon(status: BarOrderStatus) {
  switch (status) {
    case 'draft':
      return FileEdit;
    case 'confirmed':
      return CheckCircle;
    case 'ordered':
      return ShoppingCart;
    case 'delivered':
      return PackageCheck;
    default:
      return FileEdit;
  }
}

/**
 * Status badge component with appropriate colors and optional icon
 *
 * Colors:
 * - draft: gray
 * - confirmed: blue
 * - ordered: orange
 * - delivered: green
 */
export function BarOrderStatusBadge({
  status,
  showIcon = false,
  className,
}: BarOrderStatusBadgeProps) {
  const config = getBarOrderStatusBadge(status);
  const variant = getBarOrderBadgeVariant(status);
  const Icon = getStatusIcon(status);

  return (
    <Badge
      variant={variant}
      className={`${config.bgColor} ${config.color} border-0 ${className || ''}`}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
