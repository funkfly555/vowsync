/**
 * Payment Status Calculation Utility
 * @feature 009-vendor-payments-invoices
 * T008: Payment status calculation based on dates
 */

import { differenceInDays } from 'date-fns';
import type { PaymentDisplayStatus, PaymentStatusDisplay } from '@/types/vendor';

/**
 * Calculate the display status for a payment based on its dates and status
 *
 * Status priority:
 * 1. Paid (paid_date set) - Green
 * 2. Cancelled - Gray
 * 3. Overdue (past due date) - Red
 * 4. Due Soon (within 7 days) - Orange
 * 5. Pending (more than 7 days away) - Blue
 */
export function getPaymentDisplayStatus(payment: {
  status: string;
  due_date: string;
  paid_date: string | null;
}): PaymentStatusDisplay {
  // Paid takes precedence
  if (payment.paid_date || payment.status === 'paid') {
    return {
      status: 'paid',
      label: 'Paid',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: 'CheckCircle',
    };
  }

  // Cancelled
  if (payment.status === 'cancelled') {
    return {
      status: 'cancelled',
      label: 'Cancelled',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      icon: 'XCircle',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(payment.due_date);
  dueDate.setHours(0, 0, 0, 0);
  const daysUntilDue = differenceInDays(dueDate, today);

  // Overdue (past due date)
  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue);
    return {
      status: 'overdue',
      label: daysOverdue === 1 ? 'Overdue by 1 day' : `Overdue by ${daysOverdue} days`,
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: 'AlertCircle',
    };
  }

  // Due Soon (within 7 days)
  if (daysUntilDue <= 7) {
    let label: string;
    if (daysUntilDue === 0) {
      label = 'Due today';
    } else if (daysUntilDue === 1) {
      label = 'Due tomorrow';
    } else {
      label = `Due in ${daysUntilDue} days`;
    }
    return {
      status: 'due-soon',
      label,
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      icon: 'Clock',
    };
  }

  // Pending (more than 7 days away)
  return {
    status: 'pending',
    label: 'Pending',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'Clock',
  };
}

/**
 * Get badge variant for shadcn Badge component
 */
export function getPaymentBadgeVariant(
  status: PaymentDisplayStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'paid':
      return 'default';
    case 'cancelled':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    case 'due-soon':
    case 'pending':
    default:
      return 'outline';
  }
}

/**
 * Check if a payment can be edited (only unpaid payments)
 */
export function canEditPayment(payment: { status: string; paid_date: string | null }): boolean {
  return !payment.paid_date && payment.status !== 'paid' && payment.status !== 'cancelled';
}

/**
 * Check if a payment can be marked as paid
 */
export function canMarkAsPaid(payment: { status: string; paid_date: string | null }): boolean {
  return !payment.paid_date && payment.status !== 'paid' && payment.status !== 'cancelled';
}

/**
 * Check if a payment can be deleted (warning for paid)
 */
export function canDeletePayment(payment: { status: string; paid_date: string | null }): {
  canDelete: boolean;
  warning: string | null;
} {
  if (payment.paid_date || payment.status === 'paid') {
    return {
      canDelete: true,
      warning: 'This payment has been marked as paid. Deleting it will remove the payment record.',
    };
  }
  return { canDelete: true, warning: null };
}
