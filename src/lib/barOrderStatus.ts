/**
 * Bar Order Status Helpers and Color Mappings
 * @feature 012-bar-order-management
 */

import type { BarOrderStatus, BarOrderStatusBadge } from '@/types/barOrder';

// =============================================================================
// Status Configuration
// =============================================================================

/**
 * Status badge configuration with colors matching design system
 *
 * Status workflow: draft -> confirmed -> ordered -> delivered
 * Colors per spec:
 * - draft: gray (not started)
 * - confirmed: blue (confirmed but not ordered)
 * - ordered: orange (order placed, awaiting delivery)
 * - delivered: green (complete)
 */
export const BAR_ORDER_STATUS_CONFIG: Record<BarOrderStatus, BarOrderStatusBadge> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  ordered: {
    label: 'Ordered',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get badge configuration for a status
 */
export function getBarOrderStatusBadge(status: BarOrderStatus): BarOrderStatusBadge {
  return BAR_ORDER_STATUS_CONFIG[status] || BAR_ORDER_STATUS_CONFIG.draft;
}

/**
 * Get badge variant for shadcn Badge component
 */
export function getBarOrderBadgeVariant(
  status: BarOrderStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'delivered':
      return 'default';
    case 'confirmed':
      return 'secondary';
    case 'ordered':
      return 'outline';
    case 'draft':
    default:
      return 'outline';
  }
}

/**
 * Get Lucide icon name for status
 */
export function getBarOrderStatusIcon(status: BarOrderStatus): string {
  switch (status) {
    case 'draft':
      return 'FileEdit';
    case 'confirmed':
      return 'CheckCircle';
    case 'ordered':
      return 'ShoppingCart';
    case 'delivered':
      return 'PackageCheck';
    default:
      return 'Circle';
  }
}

/**
 * Check if status can be changed to a new status
 * Allows both forward and backward transitions
 */
export function canChangeStatus(
  currentStatus: BarOrderStatus,
  newStatus: BarOrderStatus
): boolean {
  // Allow any status change (no strict workflow enforcement)
  return currentStatus !== newStatus;
}

/**
 * Get next logical status in the workflow
 */
export function getNextStatus(currentStatus: BarOrderStatus): BarOrderStatus | null {
  switch (currentStatus) {
    case 'draft':
      return 'confirmed';
    case 'confirmed':
      return 'ordered';
    case 'ordered':
      return 'delivered';
    case 'delivered':
      return null; // End of workflow
    default:
      return null;
  }
}

/**
 * Get all available statuses for dropdown
 */
export function getAllStatuses(): BarOrderStatus[] {
  return ['draft', 'confirmed', 'ordered', 'delivered'];
}

/**
 * Get status options for select dropdown
 */
export function getStatusOptions(): Array<{ value: BarOrderStatus; label: string }> {
  return getAllStatuses().map((status) => ({
    value: status,
    label: BAR_ORDER_STATUS_CONFIG[status].label,
  }));
}

/**
 * Check if order is in a final state
 */
export function isOrderComplete(status: BarOrderStatus): boolean {
  return status === 'delivered';
}

/**
 * Check if order can be edited (not delivered)
 */
export function canEditOrder(status: BarOrderStatus): boolean {
  return status !== 'delivered';
}

/**
 * Get human-readable status description
 */
export function getStatusDescription(status: BarOrderStatus): string {
  switch (status) {
    case 'draft':
      return 'Order is being planned and can be modified';
    case 'confirmed':
      return 'Order details are finalized and ready to place';
    case 'ordered':
      return 'Order has been placed with the vendor';
    case 'delivered':
      return 'Order has been received and completed';
    default:
      return '';
  }
}
