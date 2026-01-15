/**
 * Invoice Status Calculation Utility
 * @feature 009-vendor-payments-invoices
 * T009: Invoice status calculation based on dates
 */

import { differenceInDays } from 'date-fns';
import type { InvoiceDisplayStatus, InvoiceStatusDisplay, InvoiceStatus } from '@/types/vendor';

/**
 * Calculate the display status for an invoice based on its dates and status
 *
 * Status priority:
 * 1. Paid - Green
 * 2. Cancelled - Gray
 * 3. Overdue (past due date and not paid) - Red
 * 4. Partially Paid - Yellow
 * 5. Unpaid - Blue
 */
export function getInvoiceDisplayStatus(invoice: {
  status: InvoiceStatus;
  due_date: string;
  paid_date: string | null;
}): InvoiceStatusDisplay {
  // Paid takes precedence
  if (invoice.paid_date || invoice.status === 'paid') {
    return {
      status: 'paid',
      label: 'Paid',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: 'CheckCircle',
    };
  }

  // Cancelled
  if (invoice.status === 'cancelled') {
    return {
      status: 'cancelled',
      label: 'Cancelled',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      icon: 'XCircle',
    };
  }

  // Check for overdue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(invoice.due_date);
  dueDate.setHours(0, 0, 0, 0);
  const daysUntilDue = differenceInDays(dueDate, today);

  // Overdue (past due date - we already handled paid/cancelled above)
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

  // Partially Paid
  if (invoice.status === 'partially_paid') {
    return {
      status: 'partial',
      label: 'Partially Paid',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: 'Clock',
    };
  }

  // Unpaid (default)
  return {
    status: 'unpaid',
    label: 'Unpaid',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'FileText',
  };
}

/**
 * Get badge variant for shadcn Badge component
 */
export function getInvoiceBadgeVariant(
  status: InvoiceDisplayStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'paid':
      return 'default';
    case 'cancelled':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    case 'partial':
    case 'unpaid':
    default:
      return 'outline';
  }
}

/**
 * VAT rate for South Africa (15%)
 */
export const VAT_RATE = 0.15;

/**
 * Calculate VAT amount from subtotal
 */
export function calculateVAT(subtotal: number): number {
  return Math.round(subtotal * VAT_RATE * 100) / 100;
}

/**
 * Calculate total from subtotal and VAT
 */
export function calculateTotal(amount: number, vatAmount: number): number {
  return Math.round((amount + vatAmount) * 100) / 100;
}

/**
 * Format currency in South African Rand
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Check if an invoice can be edited
 */
export function canEditInvoice(invoice: { status: InvoiceStatus; paid_date: string | null }): boolean {
  return !invoice.paid_date && invoice.status !== 'paid' && invoice.status !== 'cancelled';
}

/**
 * Check if an invoice can be marked as paid
 */
export function canMarkInvoiceAsPaid(invoice: { status: InvoiceStatus; paid_date: string | null }): boolean {
  return !invoice.paid_date && invoice.status !== 'paid' && invoice.status !== 'cancelled';
}
